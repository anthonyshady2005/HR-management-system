"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AprprovalChainModule = void 0;
const common_1 = require("@nestjs/common");
const aprproval_chain_service_1 = require("./aprproval-chain.service");
const aprproval_chain_controller_1 = require("./aprproval-chain.controller");
let AprprovalChainModule = class AprprovalChainModule {
};
exports.AprprovalChainModule = AprprovalChainModule;
exports.AprprovalChainModule = AprprovalChainModule = __decorate([
    (0, common_1.Module)({
        controllers: [aprproval_chain_controller_1.AprprovalChainController],
        providers: [aprproval_chain_service_1.AprprovalChainService],
    })
], AprprovalChainModule);
//# sourceMappingURL=aprproval-chain.module.js.map