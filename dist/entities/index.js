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
exports.GroupConfig = exports.SwapEvent = void 0;
const typeorm_1 = require("typeorm");
let SwapEvent = class SwapEvent {
    id; // Definite assignment assertion
    txHash;
    blockNumber;
    tokenAddress;
    amountIn;
    amountOut;
    timestamp;
};
exports.SwapEvent = SwapEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SwapEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SwapEvent.prototype, "txHash", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SwapEvent.prototype, "blockNumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SwapEvent.prototype, "tokenAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 36, scale: 18 }),
    __metadata("design:type", String)
], SwapEvent.prototype, "amountIn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 36, scale: 18 }),
    __metadata("design:type", String)
], SwapEvent.prototype, "amountOut", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SwapEvent.prototype, "timestamp", void 0);
exports.SwapEvent = SwapEvent = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Index)(['txHash'], { unique: true })
], SwapEvent);
let GroupConfig = class GroupConfig {
    id;
    chatId;
    tokenAddress;
    isActive;
    createdAt;
};
exports.GroupConfig = GroupConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GroupConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GroupConfig.prototype, "chatId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GroupConfig.prototype, "tokenAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], GroupConfig.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GroupConfig.prototype, "createdAt", void 0);
exports.GroupConfig = GroupConfig = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Index)(['chatId'], { unique: true })
], GroupConfig);
