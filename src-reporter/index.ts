import { each } from 'realm-utils';
declare const FuseBox: any;

let ansi, cursor;
if (FuseBox.isServer) {
    ansi = require("ansi");
    cursor = ansi(process.stdout);
}




const $indentString = (str: string, amount: number) => {

    let lines = str.split(/\r?\n/)
    let newLines = [];
    let emptySpace = "";
    for (let i = 0; i < amount; i++) {
        emptySpace += " ";
    }
    for (let i = 0; i < lines.length; i++) {
        newLines.push(emptySpace + lines[i])
    }
    return newLines.join('\n');
}

const $printCategory = (title: string) => {
    if (cursor) {
        cursor.write(' ')

            .bold().write(`\n   ${title} ______________________ `)
            .bg.reset()
        cursor.write("\n")

        cursor.reset();
    }
}
const $printSubCategory = (title: string) => {
    if (cursor) {
        cursor.write('    ').bold().brightBlack().write(`${title} →`)
        cursor.write("\n");
        cursor.reset();
    }
}
const $printLine = () => {
    if (cursor) {
        cursor.write("\n");
        cursor.reset();
    }
}
const $printCaseSuccess = (name: string) => {
    if (cursor) {
        cursor.green().write(`      ✓ `)
            .brightBlack().write(name);
        cursor.write("\n");
        cursor.reset();
    }
}

const $printCaseError = (name: string, message) => {
    if (cursor) {
        cursor.red().bold().write(`      ✗ `)
            .red().write(name);
        cursor.write("\n");
        cursor.reset();
        if (message) {
            cursor.white().write($indentString(message, 10));
            cursor.write("\n");
        }
        cursor.reset();
    }
}

const $printHeading = (fileAmount) => {
    if (cursor) {
        cursor.yellow()
            .bold().write(`> Launching tests ... `);
        cursor.write("\n");
        cursor.write(`> Found ${fileAmount} files`);
        cursor.write("\n");
        cursor.reset();
    }
}

const $printStats = (data, took) => {
    if (cursor) {
        const amount = data.length;
        let totalTasks = 0;
        let failed = 0;
        let passed = 0;
        each(data, items => {
            each(items, (info, item) => {
                totalTasks += info.tasks.length;
                each(info.tasks, (task) => {
                    if (task.data.success) {
                        passed++;
                    }
                    if (task.data.error) {
                        failed++;
                    }
                })
            });
        });
        cursor.write("\n");
        cursor.write("   ☞ ");
        cursor.write("\n   ");



        cursor.green().write(` ${passed} passed `)
        cursor.reset();

        if (failed > 0) {

            cursor.write(" ")
            cursor.bold().red().write(` ${failed} failed `)
            cursor.reset();

            cursor.brightBlack().write(` (${took}ms)`)
            cursor.write("\n   ")

            cursor.reset()

            cursor.write("\n")
        } else {

            cursor.brightBlack().write(` (${took}ms)`).reset();
        }

        cursor.reset();





    }
}

export default class FuseBoxTestReporter {
    constructor() { }
    public initialize(tests) {
        const amount = Object.keys(tests).length;
        $printHeading(amount)
    }

    public startFile(name: string) {
        $printCategory(name);
    }
    public startClass(name: string, item: any) {
        $printSubCategory(item.title)
    }
    public endClass() {
        //$printLine();
        //$printSubCategory(item.title)
    }
    public testCase(report: any) {
        if (report.data.success) {
            $printCaseSuccess(report.item.title || report.item.method)
        } else {
            let message = report.data.error.message ? report.data.error.message : report.data.error;
            $printCaseError(report.item.title || report.item.method, message)
        }
    }

    public endTest(stats, took) {
        $printStats(stats, took);
    }
}