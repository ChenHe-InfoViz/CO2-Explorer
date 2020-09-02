var mongoose = require('mongoose');

var noteSchema = new mongoose.Schema({
	username: String,
	time: String,
	oldTime: Array,
	"note": String,
	entities: [{
		text: String,
		"value": Number, //type: point
		// gender: String, //type: point
		entities: [String],
		countries: [String],
		year: Number, //type: line
		note: mongoose.Schema.Types.ObjectId, //type: note
		"type": {type: String},
		_id: mongoose.Schema.Types.ObjectId
	}],
	up: Array,
	delete: Boolean,
	down: Array,
	public: Boolean,
	old: Boolean,
	oldNotes: Array,
	citeBy: [{
		public: Boolean,
		username: String,
		_id: mongoose.Schema.Types.ObjectId
	}],
	version: String
})

var entitySchema = new mongoose.Schema({
	text: String,
	"value": Number,
	// gender: String,
	entities: [String],
	year: Number,
	countries: [String],
	// note: mongoose.Schema.Types.ObjectId,
	"type": {type: String},
	"noteCount": {type: Number, required: true, default: 1},
	// "noteCount": {type: Number, required: true, default: 0},
}, { collection: 'entities' })

var yearSchema = new mongoose.Schema({
	"value": {type: Number},
	"noteCount": {type: Number, required: true, default: 1},
})

var occupationSchema = new mongoose.Schema({
	// _id: {type: String},
	"value": {type: String},
	"noteCount": {type: Number, required: true, default: 1},
	// "noteCount": {type: Number, required: true, default: 0},
})

// var historySchema = new mongoose.Schema({
// 	action: {type: String, required: true},
// 	_id: {type: String, required: true, unique: true, index: true},
// 	parent: {type: String},
// 	children: Array,
// 	selectedEntities: [{
// 		entity: {type: String},
// 		"type": {type: String},
// 		_id: {type: String},
// 	}],
// 	noteids: Array,
// 	// index: {type: Number, required: true}
// }, {strict: false})

var logSchema = new mongoose.Schema({
	// _id: {type: String, required: true},
	"type": {type: String, required: true},
	time: {type: String, required: true},
	user: {type: String}
}, {strict: false})

// var Dtcbio = mongoose.model('document', bioSchema);
// var Effect = mongoose.model('effect', effectSchema);
var Note = mongoose.model('note', noteSchema);
var Occupation = mongoose.model('occupation', occupationSchema);
var Entity = mongoose.model('entity', entitySchema);
var Year = mongoose.model('year', yearSchema);
var Log = mongoose.model('log', logSchema);


module.exports = {
	Note: Note,
	Entity: Entity,
	Occupation: Occupation,
	Year: Year,
	Log: Log
}

