$(window).load(function() {

    // Populated when loading the docs.
    var docs = {};

    // Check if Android
    var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
    if (isAndroid) console.log("Wow, a droid!");

    // Default configuration,
    var config = {
        constants: [
            'constant'
        ],
        marked: {
            renderer: new marked.Renderer(),
            gfm: true,
            tables: true,
            breaks: true,
            pedantic: false,
            sanitize: true,
            smartLists: false,
            smartypants: false
        }
    };

    // Configure marked.
    marked.setOptions(config.marked);

    var listNamespace = function(namespace) {

        var data = docs[namespace];
        if (!data) {
            console.log("This item doesn't exist.");
            return false;
        }

        window.location.hash = namespace;

        $('#current-doc #intro, #current-doc #actual-doc').hide();
        $('#current-doc #namespace-list').show();

        $("#current-doc #namespace-list .list-group").html("");

        for (child in docs[namespace].values) {
            var href = $("<a>");
            href.attr("href", "#" + namespace + "." + child)
                .addClass("list-group-item")
                .text(namespace + "." + (docs[namespace].values[child].display ? docs[namespace].values[child].display : child));

            $("#current-doc #namespace-list .list-group").append(href);
        }

        // Show title.
        $('#current-doc #namespace-list h1').text(namespace);

    };

    var orderKeys = function(obj, expected) {
				// from http://stackoverflow.com/a/33049762
        var keys = Object.keys(obj).sort(function keyOrder(k1, k2) {
            if (k1 < k2) return -1;
            else if (k1 > k2) return +1;
            else return 0;
        });

        var i, after = {};
        for (i = 0; i < keys.length; i++) {
            after[keys[i]] = obj[keys[i]];
            delete obj[keys[i]];
        }

        for (i = 0; i < keys.length; i++) {
            obj[keys[i]] = after[keys[i]];
        }
        return obj;
    };

    var populateBody = function(namespace, namespaceValueName) {

        if (!namespaceValueName) {
            listNamespace(namespace);
            return false;
        }

        var data = docs[namespace].values[namespaceValueName];
        if (!data) {
            console.log("This item doesn't exist.");
            return false;
        }

        window.location.hash = namespace + '.' + namespaceValueName;

        if (data.display) namespaceValueName = data.display;
        if (data.type == 'string') namespaceValueName = '"' + namespaceValueName + '"';

        $('#current-doc #intro, #current-doc #namespace-list').hide();
        $('#current-doc #actual-doc').show();

        // Determine correct type for displaying signature.
        if ($.inArray(data.type, config.constants) < 0) {

            // Show signature correctly.
            // Only show the namespace when not using hooks,
            // because in hooks, the "namespace" is only used to organize them.
            $('#current-doc pre code').html(
                (docs[namespace].namespace ? namespace + "." : '') + namespaceValueName + '(<span class="args"></span>)' + (data.returns ? ' -> ' + data.returns : ''));

            if (data.args) {
                var args = data.args.split(',');
                var names = false;
                if (data.hasOwnProperty('arg_names')) {
                    names = data.arg_names.split(',');
                }
                for (var i = 0; i < args.length; i++) {
                    var argSpan = $("<span>");
                    if (names) {
                        argSpan.text(names[i].trim());
                        argSpan.prop('title', args[i].trim());
                        argSpan.attr('data-toggle', 'tooltip');
                        console.log('tt added');
                    } else {
                        argSpan.text(args[i].trim());
                    }

                    $("#current-doc pre code span.args").append(argSpan).append((i == args.length - 1) ? "" : ", ");
                }
            }

            if (data.example) {
                // Show example for entries that have them.
                $("#current-doc #doc-example, #current-doc #doc-example-header").show();
                $("#current-doc #doc-example").html(marked(data.example));
                if (isAndroid) {
                    $("<a>").text("Try code in BlockLauncher")
                        .prop("download", "zxc_example.js")
                        .prop("href", "#")
                        .addClass("btn btn-block btn-warning")
                        .insertAfter($("#current-doc #doc-example pre"));
                }
            } else {
                $('#current-doc #doc-example, #current-doc #doc-example-header').hide();
            }
        } else {
            // Show constant.
            $('#current-doc pre code').text((docs[namespace].namespace ? namespace + "." : '') + namespaceValueName);

            // Hide example for entries that don't have them.
            $('#current-doc #doc-example, #current-doc #doc-example-header').hide();
        }

        // Show title.
        $('#current-doc #actual-doc h1').text((docs[namespace].namespace ? namespace + "." : '') + namespaceValueName);

        // Show description
        $('#current-doc #doc-description').html(marked(data.description));

        $('html, body').animate({
            scrollTop: $('#current-doc').offset().top
        }, 250);
    };

    var hash = function() {
        var func = window.location.hash.substr(1);
        if (func) { // No point running a bunch of code if it's not needed
            func = func.split('.', 2);
            console.log('Loading ' + func[0] + '.' + func[1] + ' from URL');
            populateBody(func[0], func[1]);
        }
    }

    // Populate side nav from doc data.
    var populateNav = function() {
        // Go through all of the namespaces.
        // ModPE, Level, etc...
        for (namespace in docs) {

            // Create section element
            var nSection = $('<section>');
            nSection.addClass('nav-section');

            // Create label
            var nSectionLabel = $('<label>');
            nSectionLabel
                .addClass('nav-section-label')
                .addClass('nav-section-closed')
                .addClass('nav-section-label-' + namespace.toLowerCase())
                .text(namespace)
                .appendTo(nSection);

            // Create contents
            var nSectionContents = $('<div>');
            nSectionContents.addClass('nav-section-contents');

            // Make a list to populate the values of a table-table.
            var nList = $('<ul>');

            // Populate contents
            for (child in docs[namespace].values) {
                //if (child == 'type') continue; // Internal value to represent type of contents
                var nListItem = $('<li>');

                // Add internal data
                var text = (docs[namespace].namespace ? namespace + "." : '') + (docs[namespace].values[child].display ? docs[namespace].values[child].display : child);

                nListItem
                    .text(text) // Add the text of the namespace value.
                    .attr('data-table-table', namespace) // Add name of namespace.
                    .attr('data-table-table-key', child) // Add name of namespace value.
                    .appendTo(nList); // Then append it to the namespace list.
            }

            // Add list of namespaces
            nList.appendTo(nSectionContents);
            nSectionContents.appendTo(nSection);

            // Add to nav
            nSection.appendTo($('#nav-menu'));

            // Called when we click a namespace value.
            // Should open up in right side.
            $('.nav-section-contents ul li').on('click', function() {
                var namespace = $(this).attr('data-table-table');
                var namespaceValueName = $(this).attr('data-table-table-key');

                populateBody(namespace, namespaceValueName);
            });
        }
    };

    // Fetch and load data.
    // (Shouldn't take a while!)
    console.log('Fetching...');
    $.get('data/docs.json', function(data) {
        console.log('Fetched...');

        $.extend(config, data.config);

        docs = data.docs;

				for (namespace in docs) {
					docs[namespace].values = orderKeys(docs[namespace].values);
				}

        populateNav();
        $('.nav-section .nav-section-contents').hide();
        $('.nav-section-label').click(function() {
            $(this).parent().find('.nav-section-contents').slideToggle(150);
            if ($(this).hasClass('nav-section-open')) {
                $(this).removeClass('nav-section-open');
                $(this).addClass('nav-section-closed');
            } else {
                $(this).removeClass('nav-section-closed');
                $(this).addClass('nav-section-open');
            }
        });

        hash();

    });

    // Init search filter thing
    $("#search").on("keyup", function() {

        var search_term = $(this).val().toLowerCase();

        $("#nav-menu .nav-section").each(function() {

            var section_shown = false;

            $(this).find("li").each(function() {
                // Show results that include the term, or all if the search is empty
                if ($(this).text().toLowerCase().indexOf(search_term) > -1 || $(this).text() == "") {
                    $(this).show();
                    // As at least 1 item needs to be shown, the parent section must be
                    section_shown = true;
                } else {
                    $(this).hide();
                }
            });

            (section_shown) ? $(this).show(): $(this).hide();
        });


    });

    $("#home").on('click', function() {
        $('#current-doc #actual-doc, #current-doc #namespace-list').hide();
        $('#current-doc #intro').show();
        window.location.hash = "";
    });

    $("#doc-example").on('mousedown', "pre + a.btn", function() {
        var code = $(this).prev().children().text();
        var url = "data:application/javascript;charset=UTF-8," + encodeURIComponent(code);
        $(this).prop("href", url);
    });

    $(window).on('hashchange', function() {
        hash();
    });

    $('#actual-doc').tooltip({
        selector: '[data-toggle=tooltip]'
    });
});
