module.exports = function(grunt) {

    grunt.initConfig({
        jsbeautifier: {
            files: [
                "**/*.js",
                "!**/*.min.js",
                "!node_modules/**/*"
            ]
        },
        uglify: {
            compress: {
                options: {
                    output: {
                        beautify: false,
                        space_colon: false,
                        bracketize: true
                    },
                    compress: {
                        sequences: true,
                        hoist_vars: true
                    },
                    preserveLicenseComments: true,
                    mangle: true,

                    generateSourceMaps: false,
                    warnings: true
                },
                files: {
                    "build/require.min.js": [
                        "build/require.js"
                    ]
                }
            }
        },
        requirejs: {
            options: {
                out: "build/require.js",
                file: "src/index.js",
                verbose: true
            }
        },
        watch: {
            scripts: {
                files: [
                    "**/*.js",
                    "!node_modules/**/*"
                ],
                tasks: ["requirejs"],
                options: {
                    spawn: false,
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-jsbeautifier");
    grunt.loadNpmTasks("grunt-require.js");

    grunt.registerTask("jsb", ["jsbeautifier"]);
    grunt.registerTask("default", ["requirejs", "jsbeautifier", "uglify"]);
};
