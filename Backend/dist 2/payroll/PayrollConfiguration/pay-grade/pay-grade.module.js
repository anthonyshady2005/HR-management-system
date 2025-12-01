"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayGradeModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const pay_grade_service_1 = require("./pay-grade.service");
const pay_grade_controller_1 = require("./pay-grade.controller");
const pay_grade_schema_1 = require("./models/pay-grade.schema");
let PayGradeModule = class PayGradeModule {
};
exports.PayGradeModule = PayGradeModule;
exports.PayGradeModule = PayGradeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'PayGrade', schema: pay_grade_schema_1.PayGradeSchema }]),
        ],
        providers: [pay_grade_service_1.PayGradeService],
        controllers: [pay_grade_controller_1.PayGradeController],
    })
], PayGradeModule);
//# sourceMappingURL=pay-grade.module.js.map