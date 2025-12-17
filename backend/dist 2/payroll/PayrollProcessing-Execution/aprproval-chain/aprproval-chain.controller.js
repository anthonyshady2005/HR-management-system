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
exports.AprprovalChainController = void 0;
const common_1 = require("@nestjs/common");
const aprproval_chain_service_1 = require("./aprproval-chain.service");
let AprprovalChainController = class AprprovalChainController {
    aprprovalChainService;
    constructor(aprprovalChainService) {
        this.aprprovalChainService = aprprovalChainService;
    }
};
exports.AprprovalChainController = AprprovalChainController;
exports.AprprovalChainController = AprprovalChainController = __decorate([
    (0, common_1.Controller)('aprproval-chain'),
    __metadata("design:paramtypes", [aprproval_chain_service_1.AprprovalChainService])
], AprprovalChainController);
//# sourceMappingURL=aprproval-chain.controller.js.map