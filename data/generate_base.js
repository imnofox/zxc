const fs = require('fs');
const path = require('path')
const CSON = require('cson');
const lineReader = require('readline');

var types = {
    namespacemethod: {
        regex: /(?:(.+)\.)?(.+)\((.+)?\);/,
        default_prefix: 'NamespaceMethod',
        can_have_ns: true
    },
    constant: {
        regex: /(.+)\.([a-zA-Z_0-9]+);/,
        can_have_ns: true
    },
    hook: {
        regex: /function (.+)\((.+)?\)/,
        default_prefix: 'Hooks',
        can_have_ns: false
    }
};

var current_lines = [];

var docs_data = CSON.parse(fs.readFileSync('docs.cson'));
console.dir(docs_data);

var lr = lineReader.createInterface({
    input: fs.createReadStream('modpescript_dump.txt')
});

lr.on('line', function(line) {
    for (t in types) {
        var match;
        if (match = line.match(types[t].regex)) {
            var ns, func, args, show_ns;

            if (types[t].can_have_ns) {
                if (match[1]) {
                    ns = match[1];
					show_ns = true;
                } else {
                    ns = types[t].default_prefix;
					show_ns = false;
                }
            } else {
                ns = types[t].default_prefix;
                show_ns = false;
            }

            console.log(ns + "/" + match[0]);

            func = types[t].can_have_ns ? match[2] : match[1];
            args = (types[t].can_have_ns ? match[3] : match[2]);

			current_lines.push(ns + '.' + func);

            if (!(ns in docs_data.docs)) {
				docs_data.docs[ns] = {
                	values: {}
            	};
			}

			if (!('namespace' in docs_data.docs[ns])) docs_data.docs[ns].namespace = show_ns;

            if (!(func in docs_data.docs[ns].values)) {
                docs_data.docs[ns].values[func] = {
                    type: t,
                    description: "No information yet.",
                    example: "No information yet."
                };
                if (args) {
					args = args.replace(/(par\d(int|String|double|float|Scriptable|Object))/g, "$2");
					// Not gonna bother changing 'Script' to 'script' or 'Entity' to 'entity' as they are proper objects.
                	docs_data.docs[ns].values[func].args = args;
                }
            }

        }
    }
});

lr.on('close', function() {

	for (namespace in docs_data.docs) {
		for (method in docs_data.docs[namespace].values) {
			if (current_lines.indexOf(namespace + '.' + method) < 0) {
				if (docs_data.docs[namespace].values[method].deprecated == false) {
					docs_data.docs[namespace].values[method].deprecated = true;
				}
			}
		}
	}

    fs.writeFileSync('docs.cson', CSON.stringify(docs_data));
    console.log('Done.');
    process.exit();
});
