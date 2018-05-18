var util = require('util');

function Val(val) {
    this.val = val;
}

Val.prototype = {
    isEmpty: function () {
        if (this.val == null) {
            return true;
        }
        switch (this.val.constructor.name) {
            case 'Boolean':
                return false;
            case 'Array':
                return this.val.length == 0;
            default:
                return !Boolean(this.val);
        }
    },
    toString: function () {
        return this.isEmpty() ? '' : this._toCode();
    },
    _toCode: function () {
        return this.toCode ? this.toCode() : this.val;
    }
};

function QuotedVal(val) {
    Val.call(this, val);
}

util.inherits(QuotedVal, Val);
QuotedVal.prototype.toCode = function () {
    return "'" + this.val + "'";
};

function LengthVal(val) {
    Val.call(this, val);
}

util.inherits(LengthVal, Val);
LengthVal.prototype.toCode = function () {
    return '( ' + this.val + ' )';
};

function ValuesVal(val) {
    Val.call(this, val);
}

util.inherits(ValuesVal, Val);
ValuesVal.prototype.toCode = function () {
    return '( ' + JSON.stringify(this.val).slice(1, -1) + ' )';
};

function Field(attr) {
    var options = attr.type.options || {};

    this.type = attr.type.key;
    this.name = attr.field;

    this.autoIncrement = new Val(attr.autoIncrement);
    this.allowNull = new Val(attr.allowNull);
    this.defaultValue = new Val(attr.defaultValue);
    this.primaryKey = new Val(attr.primaryKey);
    this.onDelete = new QuotedVal(attr.onDelete);
    this.onUpdate = new QuotedVal(attr.onUpdate);

    this.references = attr.references;

    this.unsigned = options.unsigned;
    this.values = new ValuesVal(options.values);
    this.length = new LengthVal(options.length);

}

Field.create = function (attr) {
    return new Field(attr);
};

Field.opts = [
    'autoIncrement',
    'allowNull',
    'defaultValue',
    'primaryKey',
    'onDelete',
    'onUpdate'
];

exports.Field = Field;

function Model(model) {
    this.tableName = model.tableName;
    this.uniqueKeys = model.uniqueKeys;
    this.fields = Model.getReOrderedFields(model.attributes);
}

Model.getReOrderedFields = function (attsObj) {
    var fieldNames = Object.keys(attsObj);
    var indexOfIdField = fieldNames.indexOf('id');
    if (indexOfIdField > -1) {
        fieldNames = fieldNames.splice(indexOfIdField, 1).concat(fieldNames);
    }
    return fieldNames.map(function (name) {
        return Field.create(attsObj[name]);
    });
};

exports.Model = Model;


