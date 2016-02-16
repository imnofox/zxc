$(window).load(function () {
    if (typeof window.marked !== "undefined") {
        $("#uhoh").hide();
    }


    // Dtable (data table).
    //
    // Populated when loading the docs.
    var docs = {};

    // Default configuration, 
    var config = {
        constants: [
            'constants'
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

    // Populate side nav from doc data.
    var populateNav = function () {
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
                var text = (docs[namespace].namespace ? namespace + "." : '') + child;
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

        }

        // Called when we click a namespace value.
        // Should open up in right side.
        $('.nav-section-contents ul li').on('click', function () {
            var namespace = $(this).attr('data-table-table');
            var namespaceValueName = $(this).attr('data-table-table-key');

            var data = docs[namespace].values[namespaceValueName];
            $('#current-doc #intro').hide();
            $('#current-doc #actual-doc').show();

            // Show title.
            $('#current-doc #actual-doc h1').text((docs[namespace].namespace ? namespace + "." : '') + namespaceValueName);

            // Determine correct type for displaying signature.
            if (!(data.type in config.constants)) {
                // Show signature correctly.
                // Only show the namespace when not using hooks,
                // because in hooks, the "namespace" is only used to organize them.
                $('#current-doc pre code').text(
                    (docs[namespace].namespace ? namespace + "." : '') + namespaceValueName + '(' +
                    (data.args || '') + ')' + (data.returns ? ' -> ' + data.returns : ''));

                // Show example for entries that have them.
                $('#current-doc #doc-example, #current-doc #doc-example-header').show();
                $('#current-doc #doc-example').html(marked(data.example));
            } else {
                // Show constant.
                $('#current-doc pre code').text((docs[namespace].namespace ? namespace + "." : '') + namespaceValueName);

                // Hide example for entries that don't have them.
                $('#current-doc #doc-example, #current-doc #doc-example-header').hide();
            }

            // Show description
            $('#current-doc #doc-description').html(marked(data.description));

            $('html, body').animate({
                scrollTop: $('#current-doc').offset().top
            }, 250);
        });
    };

    // Fetch and load data.
    // (Shouldn't take a while!)
    console.log('Fetching...');
    $.get('data/docs.json', function (data) {
        console.log('Fetched...');

        $.extend(config, data.config);

        docs = data.docs;
        console.log(docs);

        /*for (key in info.docs) {
            // Hook, create it as a global name.
            if (records.docs[key].type == 'hook') {
                if (!dtable.Hooks) {
                    dtable.Hooks = {};
                    dtable.Hooks.type = 'hook_table';
                }

                dtable.Hooks[key] = records.docs[key];
            } else {
                // Split into parts, because this isn't a hook.
                var parts = key.split('.');

                // Create new table if it doesn't exist.
                if (!dtable[parts[0]]) {
                    dtable[parts[0]] = {};
                    dtable[parts[0]].type = records.docs[key].type + "_table";
                }

                // Add it into the table.
                dtable[parts[0]][parts[1]] = records.docs[key];
            }
        }*/

        populateNav();
        $('.nav-section .nav-section-contents').hide();
        $('.nav-section-label').click(function () {
            $(this).parent().find('.nav-section-contents').slideToggle(150);
            if ($(this).hasClass('nav-section-open')) {
                $(this).removeClass('nav-section-open');
                $(this).addClass('nav-section-closed');
            } else {
                $(this).removeClass('nav-section-closed');
                $(this).addClass('nav-section-open');
            }
        });
    });

    //$('#actual-doc').hide();

    // Init search filter thing
    $("#search").on("keyup", function () {

        var search_term = $(this).val().toLowerCase();

        $("#nav-menu .nav-section").each(function () {

            var section_shown = false;

            $(this).find("li").each(function () {
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

    $("#home").on('click', function () {
        $('#current-doc #actual-doc').hide();
        $('#current-doc #intro').show();
    });


});