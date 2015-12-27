$(document).ready(function() {
  // Dtable (data table).
  //
  // Populated when loading the docs.
  window.dtable = {};

  // Populate side nav from dtable.
  var populateNav = function() {
    // Go through all of the keys in the table.
    // ModPE, Level, etc...
    for (tablekey in dtable) {
      var tableval = dtable[tablekey];

      if (tableval.type != 'hook') {
        // A constant table or a namespacemethod table...
        // Create section element
        var nSection = $('<section>');
        nSection.addClass('nav-section');

        // Create label
        var nSectionLabel = $('<label>');
        nSectionLabel
          .addClass('nav-section-label')
          .addClass('nav-section-label-' + tableval.type.toLowerCase())
          .text(tablekey)
          .appendTo(nSection);

        // Create contents
        var nSectionContents = $('<div>');
        nSectionContents.addClass('nav-section-contents');

        // Make a list to populate the values of a table-table.
        var nList = $('<ul>');

        // Populate contents
        for (child in tableval) {
          if (child == 'type') continue; // Internal value to represent type of contents
          var nListItem = $('<li>');

          // Add internal data
          nListItem
            .text(child) // Add the text of the namespace value.
            .attr('data-table-table', tablekey) // Add name of namespace.
            .attr('data-table-table-key', child) // Add name of namespace value.
            .appendTo(nList); // Then append it to the namespace list.
        }

        // Add list of namespaces
        nList.appendTo(nSectionContents);
        nSectionContents.appendTo(nSection);

        // Add to nav
        nSection.appendTo($('#nav-menu'));
      }
    }

    // Called when we click a namespace value.
    // Should open up in right side.
    $('.nav-section-contents ul li').click(function() {
      var namespace = $(this).attr('data-table-table');
      var namespaceValueName = $(this).attr('data-table-table-key');

      var data = dtable[namespace][namespaceValueName];
      $('#current-doc #intro').hide();
      $('#current-doc #actual-doc').show();

      $('#current-doc #actual-doc h1').text(
        (data.type == 'hook' ? '' : namespace + '.') + namespaceValueName);

      // Determine correct type for displaying signature.
      if (data.type == 'namespacemethod' || data.type == 'hook') {
        // Show signature correctly.
        $('#current-doc pre code').text(
          (data.type == 'hook' ? '' : namespace + '.') + namespaceValueName + '(' +
          (data.args || '') + ')');
      } else if (data.type == 'constant') {
        // Show constant.
        $('#current-doc pre code').text(namespace + '.' + namespaceValueName);
      }

      // Show description
      $('#current-doc #doc-description').text(data.description);

      // Show description for namespacemethods and hooks
      if (data.type == 'namespacemethod' || data.type == 'hook') {
        // Show example for entries that have them.
        $('#current-doc #doc-example, #current-doc #doc-example-header').show();
        $('#current-doc #doc-example').text(data.example);
      } else {
        // Hide example for entries that don't have them.
        $('#current-doc #doc-example, #current-doc #doc-example-header').hide();
      }
    });
  };

  // Fetch and load data.
  // (Shouldn't take a while!)
  $.get('/data/docs.yml', {}, function(data) {
    window.g = jsyaml.load(data);

    for (key in g.docs) {
      // Hook, create it as a global name.
      if (g.docs[key].type == 'hook') {
        if (!dtable.Hooks) {
          dtable.Hooks = {};
          dtable.Hooks.type = 'hook_table';
        }

        dtable.Hooks[key] = g.docs[key];
      } else {
        // Split into parts, because this isn't a hook.
        var parts = key.split('.');

        // Create new table if it doesn't exist.
        if (!dtable[parts[0]]) {
          dtable[parts[0]] = {};
          dtable[parts[0]].type = g.docs[key].type + "_table";
        }

        // Add it into the table.
        dtable[parts[0]][parts[1]] = g.docs[key];
     }
    }

    populateNav();
    $('.nav-section .nav-section-contents').hide();
    $('.nav-section-label').click(function() {
      $(this).parent().find('.nav-section-contents').slideToggle(150);
    });
  });

  $('#actual-doc').hide();
});