const EventEmitter = require('events');
class InventoryEmitter extends EventEmitter {}
module.exports = new InventoryEmitter();
