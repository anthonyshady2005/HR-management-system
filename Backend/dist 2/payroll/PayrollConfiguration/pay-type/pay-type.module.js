"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayTypeModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const pay_type_controller_1 = require("./pay-type.controller");
const pay_type_service_1 = require("./pay-type.service");
const pay_type_schema_1 = require("./models/pay-type.schema");
let PayTypeModule = class PayTypeModule {
};
exports.PayTypeModule = PayTypeModule;
exports.PayTypeModule = PayTypeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'PayType', schema: pay_type_schema_1.PayTypeSchema }]),
        ],
        controllers: [pay_type_controller_1.PayTypeController],
        providers: [pay_type_service_1.PayTypeService],
    })
], PayTypeModule);
//# sourceMappingURL=pay-type.module.js.map