var express = require('express');
var path = require('path');
var router = express.Router();
var http = require('http');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM(`<!DOCTYPE html>`);
const $ = require('jquery')(window);
// var concat = require('array-concat')
var schedule = require('node-schedule');
// var math = require('mathjs')

var mongoose = require('mongoose');
var noteCollection = require('./schema').Note;
var occupationCollection = require('./schema').Occupation;
var yearCollection = require('./schema').Year;
var logCollection = require('./schema').Log;
var User = require('./user').User;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('index.html', { root: path.join(__dirname, '../public/javascripts') });
});

router.get("/healthtutorial", function(req, res, next) {
  res.sendFile('tutorialindex.html', { root: path.join(__dirname, '../public/javascripts') });
});

// String.prototype.capitalizeFirstLetter = function() {
 //if(this == null) return null;
    // return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
// }

router.post("/removenote", function(req, res){
  noteCollection.findById(req.query.id).exec(function(err, doc){
    if(err) return res.json(500);
    var noteEntities = doc.entities.filter( a => a.type == "note").map( a => a.note)
    noteCollection.updateMany({_id: noteEntities}, {$pull: {citeBy: {_id: doc._id}}}, function(er, r){
      if(er) console.log(er)
    })
    if(doc.public){
      decreaseEntityCount(doc.entities, doc._id)
    }
    var citeByIds = doc.citeBy.map(a => a._id)
    noteCollection.find({_id: citeByIds}, function(er, ds){
        if(er) console.log(er)
        // console.log(doc.citeBy)

        ds.forEach(function(d){
          // console.log(d._id)
          var re = d.entities.filter( a => a.type == "note" && a.note != null && a.note.toString() == doc._id)
          re[0].note = null
          re[0].text = "<i>Deleted.</i>"
          d.save(function(e){ console.log(e) })
        })
    })

    noteCollection.updateMany({_id: citeByIds}, {$pull: {entities: {note: doc._id}}})
    doc.set({delete: true})
    doc.save(function (er) {
        if (er){console.log(er); return res.json(500)};
        return res.json(204)
        // saved!
    })
  })
})

function decreaseEntityCount(entities, id){
  var tempEntities = entities.filter( a => a.type != "note")
  var entityArray = []
  var yearArray = []
  for(var i = 0; i < tempEntities.length; i++){
    var en = tempEntities[i].toObject()
    entityArray = entityArray.concat(en.entities) 
    if(en.hasOwnProperty("year"))   
      yearArray.push(en.year)

  }
  //update occupation collection as well
  entityArray = entityArray.filter((v,i) => entityArray.indexOf(v) === i)
  entityArray.forEach(function(d){
    occupationCollection.findOneAndUpdate({value: d}, {$inc:{ noteCount: -1 }}, (err, doc) => {
      if(err) console.log(err)
    })
  })
  yearArray = yearArray.filter((v,i) => yearArray.indexOf(v) === i)
  yearArray.forEach(function(d){
    yearCollection.findOneAndUpdate({value: d}, {$inc:{ noteCount: -1 }}, (err, doc) => {
      if(err) console.log(err)
      // console.log(doc)
    })
  })
}

Note = function(f, res){
  this.option = {upsert: true, new: true, setDefaultsOnInsert: true}
  this.count = 0
  this.saveFunction = this[f]
  this.res = res
}

Note.prototype.createNote = function(req){
  var self = this
  this.note = req.body;
  this.note.up = [];
  this.note.down = [];
  this.note.delete = false;
  this.note.old = false;
  this.oneNote = new noteCollection(this.note);

  // console.log(note)

  if(this.note.public){
    var entities = this.note.entities.filter( a => a.type != "note")
    //update entity count
    self.count = entities.length
    if(!self.count) self.saveFunction()
    self.updateCollections(entities)
  }
  else self.saveFunction()
}

Note.prototype.updateNote = function(req){
  var self = this
  this.oldid = req.body.oldid
  this.newNote = req.body.note;
  this.newPub = req.body.public;
  this.newEntities = req.body.entities
  this.newTime = req.body.time

  noteCollection.findById(self.oldid).exec(function(err, doc){
    if(err) return self.res.json(500);
    self.note = doc
    var noteEntities = doc.entities.filter( a => a.type == "note").map( a => a.note)
    noteCollection.updateMany({_id: noteEntities}, {$pull: {citeBy: {_id: self.oldid}}}, function(er, r){
      if(er) console.log(er)
    })
    // console.log(doc.public + " " + newPub)
    if(doc.public){
      decreaseEntityCount(doc.entities, self.oldid)
    }
    if(self.newPub){
      var entities = self.newEntities.filter( a => a.type != "note")
      //update entity count
      self.count = entities.length
      if(!self.count) self.saveFunction()
      self.updateCollections(entities)
    }
    else self.saveFunction()
  })
}

Note.prototype.updateCollections = function(entities){
  var self = this//, entities = self.entities
  var entityArray = []
  var yearArray = []
  for(var i = 0; i < entities.length; i++){
    entityArray = entityArray.concat(entities[i].entities)
    if(entities[i].hasOwnProperty("year"))
      yearArray.push(entities[i].year)
  }
  //remove duplicates
  entityArray = entityArray.filter((v,i) => entityArray.indexOf(v) === i)
  yearArray = yearArray.filter((v,i) => yearArray.indexOf(v) === i)

  self.count += entityArray.length
  self.count += yearArray.length
  // console.log(entityArray)
  // console.log(yearArray)
  yearArray.forEach(function(d){
    yearCollection.findOneAndUpdate({value: d}, {$inc:{ noteCount: 1 }}, self.option, (er, datum) => {
      if(er){
        console.log(er)
        self.checki()
        return
      }
      // if(!datum){
      //   self.insertDoc(yearCollection, {value: d})
      //   return
      // }
      self.checki()
    })
  })
  entityArray.forEach(function(d){
    occupationCollection.findOneAndUpdate({value: d}, {$inc:{ noteCount: 1 }}, self.option, (er, datum) => {
      if(er){
        console.log(er)
        self.checki()
        return
      }
      // if(!datum){
      //   self.insertDoc(occupationCollection, {value: d})
      //   return
      // }
      self.checki()
    })
  })
}


Note.prototype.savenote = function(){
  var self = this
  this.oneNote.save(function(saveErr, saveDoc){
      if (saveErr){
        console.log(saveErr); 
        return self.res.json(500)
      }
      var noteEntities = self.note.entities.filter( a => a.type == "note").map( a => a.note)
      // console.log(noteEntities)

      noteCollection.updateMany({_id: noteEntities}, {$push: {citeBy: {_id: saveDoc.id, username: self.note.username, public: self.note.public}}}, function(er, r){
        if(er) console.log(er)
        noteCollection.find({_id: noteEntities}, function(error, ds){
            // console.log(ds)
            if(error) console.log(error)
            ds.forEach(function(d){
              var t = self.note.entities.filter( a => a.type == "note" && a.note == d._id)
              if(d.note != t[0].text)
                t[0].text = "<i>(Updated)</i> " + d.note
            })
            self.oneNote.set({entities: self.note.entities})
            self.oneNote.save(function(err, doc){
              if(err) console.log(err)
              // saveOneNewNote(req.body, true)
              // console.log(doc)
              return self.res.json({id: doc._id})
            })
        })
        // console.log(d)
        // return self.res.json({id: self.oneNote._id})
      })
  })
  
}

Note.prototype.insertDoc = function(collection, entity){
  var self = this
  var oneEntity = new collection(entity)
  oneEntity.save((er) => {
    if (er) {
        console.log(er);
    }
    entity._id = oneEntity._id;
    self.checki()
  })
}
Note.prototype.check = function(er, datum, entity, collection){
  var self = this
  if(er){
      console.log(er);
      self.checki()
      return
  }
  // console.log(doc)
  if(datum){
    entity._id = datum._id;
    self.checki()
  }
  else{
    // console.log(entity)
    self.insertDoc(collection, entity)
    // console.log(entity)
  }
}

Note.prototype.checki = function(){
  this.count--
  if(!this.count){
    this.count-- 
    this.saveFunction()
  }
}

Note.prototype.updateDoc = function(findObj, entity, collection){
  var self = this
  entityCollection.findOneAndUpdate(findObj, {$inc:{ noteCount: 1 }}, self.option, (er, d) => {
    if(er){
        console.log(er)
        self.checki()
        return
      }
      self.checki()
    // self.check(er, d, entity, collection)
  })
}

Note.prototype.saveUpdatedNote = function(){
  var self = this
  this.note.oldNotes.push(this.note.note)
  self.note.oldTime.push(self.note.time)
  // doc.set({old: true})
  // if(self.newPub){
    var noteEntities = self.newEntities.filter( a => a.type == "note").map( a => a.note)
    if(self.newNote != self.note.note){
      var citeByIds = self.note.citeBy.map(a => a._id)
      noteCollection.find({_id: citeByIds}, function(er, ds){
        if(er) console.log(er)
        ds.forEach(function(d){
          // console.log(d._id)
          var re = d.entities.filter( a => a.type == "note" && a.note.toString() == self.oldid)
          re[0].text = "<i>(Updated)</i> " + self.newNote
          d.save(function(e){ console.log(e) })
        })
      })
    }
    noteCollection.updateMany({_id: noteEntities}, {$push: {citeBy: {_id: self.oldid, public: self.newPub, username: self.note.username}}}, function(er, d){
      if(er) console.log(er)
    })
    noteCollection.find({_id: noteEntities}, function(er, ds){
        if(er) console.log(er)
        ds.forEach(function(d){
          var t = self.newEntities.filter( a => a.type == "note" && a.note == d.id)
          if(d.note != t[0].text)
            t[0].text = "<i>(Updated)</i> " + d.note
        })
      self.note.set({time: self.newTime, note: self.newNote, public: self.newPub, entities: self.newEntities})
      self.note.save(function(err, doc){
        if(err) console.log(err)
        // saveOneNewNote(req.body, true)
        // console.log(doc)
        return self.res.json({id: doc._id})
      })
    })
    
  // }
  
}

router.post("/savenote", function(req, res){
  if(req.body.username == "testMedi" || req.body.username == "testHealth"){
    return res.json({id: 0})
  }
  var oneNote = new Note("savenote", res)
  oneNote.createNote(req)
})

router.post("/updatenote", function(req, res){
  var oneNote = new Note("saveUpdatedNote", res)
  oneNote.updateNote(req)

})

router.post("/viewdiscussion", function(req, res){
  var notes = []
  var count = 1
  function findNoteRecur(ids){
    // console.log(ids)
    if(!ids.length || notes.length > 20){
      calcCount()
      return
    }
    noteCollection.find({$and: [{_id: ids}, {delete: false}, {$or: [{username: req.body.username}, {public: true}]} ]}).exec(function(err, docs){
      if(err){
         console.log(err)
         calcCount()
         return
      }
      // console.log(docs)
      notes = notes.concat(docs)
      var curIdArray = notes.map( a => a._id.toString() )
      var arr = [], citeBy = []
      docs.forEach(function(d){
        arr = arr.concat( d.entities.filter(a => a.type == "note" && a.note != null ).map(a => a.note.toString() ) )
        citeBy = citeBy.concat(d.citeBy.map( a => a._id.toString()))
      })
      for(var i = arr.length - 1; i > -1; i--){
        if(curIdArray.indexOf(arr[i]) > -1)
          arr.splice(i, 1)
      }
      for(var i = citeBy.length - 1; i > -1; i--){
        if(curIdArray.indexOf(citeBy[i]) > -1)
          citeBy.splice(i, 1)
      }
      if(!arr.length && !citeBy.length){
        calcCount()
        return
      }
      count--
      if(arr.length){
        count++
        findNoteRecur(arr)
      }
      if(citeBy.length){
        count++
        findNoteRecur(citeBy)
      }
    })
  }

  function calcCount(){
    count--;
    if(!count){
      count--
      var ids = notes.map(a => a._id.toString())
      // console.log(notes)
      notes = notes.filter((v,k) => ids.indexOf(v._id.toString()) == k)
      notes.sort(function(a, b){ if(a.time < b.time) return -1; return 1;})
      
      res.json(notes)
    }
  }

  findNoteRecur([req.body.id])
})



var recordsPerRequ = 60

router.post("/note", function(req, res){
  var content = req.body;
  var username = content.username
  var filter = content.entity
  var notes = []

  if(username == "testMedi" || username == "testHealth"){
    var temp = ""
    if(username == "testHealth") temp = "tutorialHealth"
    else temp = "tutorialMedi"
    if(filter){
      noteCollection.find({ $and: [ {"entities.entities": filter}, {username: temp}, {delete: false}, {old: false}
      ]}).sort({time: 1}).limit(3).exec(function (err, docs) {
          if(err) return res.json(500);
          //console.log(docs)
          notes = docs;   
          res.json(notes.reverse());
      })
    }
    else//{
      noteCollection.find({ $and: [ {username: temp}, {delete: false}, {old: false} ]}).sort({time: 1}).limit(3).exec(function (err, docs) {
          if(err) return res.json(500);
          //console.log(docs)
          notes = docs;   
          res.json(notes.reverse());
      })
//     }
  }
  else{
    if(filter){
      var con = {}
      if(filter.hasOwnProperty("id")) con = {"entities.entities": filter.id}
      else con = {"entities.year": filter.year}
      
      noteCollection.find({ $and: [
        con, {$or: [{public: true}, {username: username}] }, {delete: false}, /*{old: false},*/
      ]}).sort({time: -1}).limit(recordsPerRequ).exec(function (err, docs) {
          if(err) return res.json(500);
          //console.log(docs)
          notes = notes.concat(docs);    
          return res.json(notes);
      })
    }
    else{

      noteCollection.find({$and: [{delete: false}, {$or: [{public: true}, {username: username}] } ]}).sort({ time: -1}).limit(recordsPerRequ).exec(function (er, data) {
        if(er){
          console.log(er)
          return res.json(500);
        }
        // notes = notes.concat(data);
        // console.log(data[1].entities)
        return res.json(data);
      });

    }
  }
})

function getTime(time){
  return new Date(time).getTime()
}

router.post("/entitynote", function(req, res){
  if(req.body.username == "testMedi" || req.body.username == "testHealth")
    return res.json({})
  noteCollection.find({ $and: [{"username": req.body.username}, {public: false}, {delete: false}, {old: false}]}).exec(function (err, docs) {
    var userEntityNote = [], userYearNote = []
    var result = {max: -1, min: 1000}
    if(err) console.log(err)//return res.json(500);
    for(var i = 0; i < docs.length; i++){
      var entityArray = [], yearArray = []
      for(var j = 0; j < docs[i].entities.length; j++){
        var en = docs[i].entities[j].toObject()
        entityArray = entityArray.concat(en.entities)
        if(en.hasOwnProperty("year")) yearArray.push(en.year)
      }
      entityArray = entityArray.filter((v,k) => entityArray.indexOf(v) === k)      
      yearArray = yearArray.filter((v,k) => yearArray.indexOf(v) === k)

      // console.log(entityArray)
      entityArray.forEach(function(d){
        var re = $.grep(userEntityNote, function(e){
          return e.entity == d
        })
        if(re.length > 0){
          re[0].count++;
          if(re[0].count > result.max) result.max = re[0].count
          if(re[0].count < result.min) result.min = re[0].count
        }
        else{
          userEntityNote.push({entity: d, count: 1})
          if(result.max < 1) result.max = 1
          if(result.min > 1) result.min = 1
        }
      })

      yearArray.forEach(function(d){
        var re = $.grep(userYearNote, function(e){
          return e.year == d
        })
        if(re.length > 0){
          re[0].count++;
          if(re[0].count > result.max) result.max = re[0].count
          if(re[0].count < result.min) result.min = re[0].count
        }
        else{
          userYearNote.push({year: d, count: 1})
          if(result.max < 1) result.max = 1
          if(result.min > 1) result.min = 1
        }
      })
        
    }
    occupationCollection.find({}).batchSize(2000).sort({value: 1}).exec(function (err1, docs1) {
      //console.log(docs)
      if(err1) console.log(err1)
      docs1.forEach(function(d){
        var re = $.grep(userEntityNote, function(e){
          return e.entity == d.value
        })
        // //re[0].toObject();
        if(re.length > 0){
          re[0].count += d.noteCount;
          if(re[0].count > result.max) result.max = re[0].count
          if(re[0].count < result.min) result.min = re[0].count
        }
        else{
          userEntityNote.push({entity: d.value, count: d.noteCount})
          if(d.noteCount > result.max) result.max = d.noteCount
          if(d.noteCount < result.min) result.min = d.noteCount
        }
      })
      result.entityNoteCount = userEntityNote
      
      yearCollection.find({}).batchSize(2000).sort({value: 1}).exec(function (err2, docs2) {
      //console.log(docs)
        if(err2) console.log(err2)
        docs2.forEach(function(d){
          var re = $.grep(userYearNote, function(e){
            return e.year == d.value
          })
          //re[0].toObject();
          if(re.length > 0){
            re[0].count += d.noteCount;
            if(re[0].count > result.max) result.max = re[0].count
            if(re[0].count < result.min) result.min = re[0].count
          }
          else{
            userYearNote.push({year: d.value, count: d.noteCount})
            if(d.noteCount > result.max) result.max = d.noteCount
            if(d.noteCount < result.min) result.min = d.noteCount
          }
        })
        result.yearNoteCount = userYearNote
        res.json(result);
      });
    });
  })
})

router.post("/savelog", function(req,res){
  // console.log(req.body)
  if(req.body.length > 0){
    logCollection.insertMany(req.body, function(error, docs) {
      if(error) console.log(error)
      return res.json(204)
    });
  }
})


module.exports = router;
