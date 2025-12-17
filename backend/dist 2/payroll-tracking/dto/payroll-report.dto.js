"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummaryReportDto = exports.ReportPeriodDto = exports.ReportType = void 0;
const class_validator_1 = require("class-validator");
var ReportType;
(function (ReportType) {
    ReportType["MONTH"] = "MONTH";
    ReportType["YEAR"] = "YEAR";
})(ReportType || (exports.ReportType = ReportType = {}));
class ReportPeriodDto {
    startDate;
    endDate;
}
exports.ReportPeriodDto = ReportPeriodDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReportPeriodDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReportPeriodDto.prototype, "endDate", void 0);
class SummaryReportDto {
    type;
    date;
}
exports.SummaryReportDto = SummaryReportDto;
__decorate([
    (0, class_validator_1.IsEnum)(ReportType),
    __metadata("design:type", String)
], SummaryReportDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SummaryReportDto.prototype, "date", void 0);
//# sourceMappingURL=payroll-report.dto.js.map