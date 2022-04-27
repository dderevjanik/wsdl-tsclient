import test from "tape";
import { existsSync } from "fs";
import { parseAndGenerate } from "../../src";
import { Logger } from "../../src/utils/logger";
import { typecheck } from "../utils/tsc";

const target = "list_parameter";

test(target, async t => {
    Logger.disabled();

    const input = `./test/resources/${target}.wsdl`;
    const outdir = "./test/generated";

    t.test(`${target} - generate wsdl client`, async t => {
        await parseAndGenerate(input, outdir);
        t.end();
    });

    t.test(`${target} - check definitions`, async t => {
        t.equal(existsSync(`${outdir}/listparameter/definitions/About.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/AboutResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/AddTimesheet.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/AddTimesheetCommitPerPeriod.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/AddTimesheetCommitPerPeriodResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/AddTimesheetEntryByChargeCode.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/AddTimesheetEntryByChargeCodeResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/AddTimesheetResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/AddTimesheetWithDefaultDistribution.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/AddTimesheetWithDefaultDistributionResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/AppSetup.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/Credentials.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/DeleteTimesheetEntry.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/DeleteTimesheetEntryResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/Entries.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/Entry.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/EntryError.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/EntryList.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/ErrorList.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/Filter.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetAppSetup.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetAppSetupResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetAppSetupResult.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetFlexiTimecode.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetFlexiTimecodeResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetFlexiTimecodeResult.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetFreeDimInformation.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetFreeDimInformationResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetIDsParameters.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetIDsParametersResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetResourceIdFromLoggedInUser.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetResourceIdFromLoggedInUserResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetResourceIdFromLoggedInUserResult.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetTimesheet.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetTimesheetFilter.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetTimesheetFilterResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetTimesheetFilterResult.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetTimesheetResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetTimesheetValues.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetTimesheetValuesResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetTimesheetValuesResult.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetTimesheetValuesWithRelatedColumns.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetTimesheetValuesWithRelatedColumnsResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetTimesheetWorkSchedule.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetTimesheetWorkScheduleResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetTimesheetWorkScheduleResult.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetTitlesById.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetTitlesByIdResponse.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/GetTitlesByIdResult.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/IdentifierList.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/Input.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/Input1.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/Input2.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/Input3.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/Input4.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/PeriodList.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/PeriodType.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/Response.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/TimesheetItem.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/TimesheetResponseList.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/TimesheetValue.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/TimesheetValueInfo.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/TimesheetValueInfoList.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/TimesheetValueList.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/Title.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/WorkDay.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/WorkDayList.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/WorkUnit.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/WorkUnitList.ts`), true);
        t.equal(existsSync(`${outdir}/listparameter/definitions/WorkflowLog.ts`), true);
        t.end();
    });

    t.test(`${target} - compile`, async t => {
        await typecheck(`${outdir}/listparameter/index.ts`);
		t.end();
    });

});