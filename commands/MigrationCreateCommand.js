"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationCreateCommand = void 0;
const tslib_1 = require("tslib");
const CommandUtils_1 = require("./CommandUtils");
const StringUtils_1 = require("../util/StringUtils");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const PlatformTools_1 = require("../platform/PlatformTools");
const path_1 = tslib_1.__importDefault(require("path"));
/**
 * Creates a new migration file.
 */
class MigrationCreateCommand {
    constructor() {
        this.command = "migration:create <path>";
        this.describe = "Creates a new migration file.";
    }
    builder(args) {
        return args
            .option("dataSource", {
            alias: "d",
            type: "string",
            describe: "Path to the file where your DataSource instance is defined.",
        })
            .option("o", {
            alias: "outputJs",
            type: "boolean",
            default: false,
            describe: "Generate a migration file on Javascript instead of Typescript",
        })
            .option("t", {
            alias: "timestamp",
            type: "number",
            default: false,
            describe: "Custom timestamp for the migration name",
        });
    }
    async handler(args) {
        let dataSource = undefined;
        try {
            if (args.dataSource) {
                dataSource = await CommandUtils_1.CommandUtils.loadDataSource(path_1.default.resolve(process.cwd(), args.dataSource));
            }
            const migrationsDir = (dataSource === null || dataSource === void 0 ? void 0 : dataSource.options.migrationsOutDir) || "";
            const timestamp = CommandUtils_1.CommandUtils.getTimestamp(args.timestamp);
            const inputPath = args.path.startsWith("/")
                ? args.path
                : path_1.default.resolve(process.cwd(), migrationsDir, args.path);
            const filename = path_1.default.basename(inputPath);
            const fullPath = path_1.default.dirname(inputPath) + "/" + timestamp + "-" + filename;
            const fileContent = args.outputJs
                ? MigrationCreateCommand.getJavascriptTemplate(filename, timestamp)
                : MigrationCreateCommand.getTemplate(filename, timestamp);
            await CommandUtils_1.CommandUtils.createFile(fullPath + (args.outputJs ? ".js" : ".ts"), fileContent);
            console.log(`Migration ${chalk_1.default.blue(fullPath + (args.outputJs ? ".js" : ".ts"))} has been generated successfully.`);
        }
        catch (err) {
            PlatformTools_1.PlatformTools.logCmdErr("Error during migration creation:", err);
            process.exit(1);
        }
    }
    // -------------------------------------------------------------------------
    // Protected Static Methods
    // -------------------------------------------------------------------------
    /**
     * Gets contents of the migration file.
     */
    static getTemplate(name, timestamp) {
        return `import { MigrationInterface, QueryRunner } from "typeorm"

export class ${(0, StringUtils_1.camelCase)(name, true)}${timestamp} implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
`;
    }
    /**
     * Gets contents of the migration file in Javascript.
     */
    static getJavascriptTemplate(name, timestamp) {
        return `const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class ${(0, StringUtils_1.camelCase)(name, true)}${timestamp} {

    async up(queryRunner) {
    }

    async down(queryRunner) {
    }

}
`;
    }
}
exports.MigrationCreateCommand = MigrationCreateCommand;

//# sourceMappingURL=MigrationCreateCommand.js.map
