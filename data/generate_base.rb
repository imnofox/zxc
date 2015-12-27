# read file
require 'fileutils'


file_data = File.read('modpescript_dump.txt')
encountered = []

puts "docs:"

file_data.each_line do |line|
  md_namespacemethod = /(.+)\.(.+)\((.+)?\);/.match(line)
  md_constant = /(.+)\.([a-zA-Z_0-9]+);/.match(line)
  md_method = /function (.+)\((.+)?\)/.match(line)

  unless md_method.nil?
    puts "  #{md_method[1]}:"
    puts "    type: hook"
    puts "    args: #{md_method[2]}"
    puts "    description: >"
    puts "      No information yet."
    puts "    example: >"
    puts "      No information yet."
  end

  unless md_constant.nil?
    puts "  #{md_constant[1]}.#{md_constant[2]}:"
    puts "    type: constant"
    puts "    description: >"
    puts "      No information yet."
  end

  unless md_namespacemethod.nil?
    md_args = line.scan(/(par\d(int|String|double|float|Scriptable|Object))/)
              .to_a

    args = []
    unless md_args.nil?
      md_args.each do |it|
        f = it[1].sub('String', 'string')
        if md_namespacemethod[1] == 'Entity'
          args << f.sub('Object', 'entity?')
        else
          args << f
        end
      end
    end

    puts "  #{md_namespacemethod[1]}.#{md_namespacemethod[2]}:"
    puts "    type: namespacemethod"
    puts "    args: #{args.join(', ')}"
    puts "    description: >"
    puts "      No information yet."
    puts "    example: >"
    puts "      No information yet."
  end
end
