"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsuranceBracketModule = void 0;
const common_1 = require("@nestjs/common");
const insurance_bracket_controller_1 = require("./insurance-bracket.controller");
const insurance_bracket_service_1 = require("./insurance-bracket.service");
let InsuranceBracketModule = class InsuranceBracketModule {
};
exports.InsuranceBracketModule = InsuranceBracketModule;
exports.InsuranceBracketModule = InsuranceBracketModule = __decorate([
    (0, common_1.Module)({
        controllers: [insurance_bracket_controller_1.InsuranceBracketController],
        providers: [insurance_bracket_service_1.InsuranceBracketService]
    })
], InsuranceBracketModule);
//# sourceMappingURL=insurance-bracket.module.js.map