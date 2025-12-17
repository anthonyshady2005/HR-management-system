"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllowanceModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const allowance_controller_1 = require("./allowance.controller");
const allowance_service_1 = require("./allowance.service");
const allowance_schema_1 = require("./models/allowance.schema");
let AllowanceModule = class AllowanceModule {
};
exports.AllowanceModule = AllowanceModule;
exports.AllowanceModule = AllowanceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'Allowance', schema: allowance_schema_1.AllowanceSchema }]),
        ],
        controllers: [allowance_controller_1.AllowanceController],
        providers: [allowance_service_1.AllowanceService],
    })
], AllowanceModule);
//# sourceMappingURL=allowance.module.js.map