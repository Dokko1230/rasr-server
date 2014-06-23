var Promise = require('bluebird');
var sampleScreens = require('../util/sampleScreens')();
var enemyHandler = require('../controllers/enemies')
var mongoose = require('mongoose');
var Screen = mongoose.model('Screen');
var helpers = require('./helpers');

Promise.promisifyAll(Screen);
Promise.promisifyAll(mongoose);


module.exports = {
  moveScreen: function(req, res) {
    var direction = req.param('direction');
    var currentObjectId = req.param('currentScreenId');
    Screen.findById(currentObjectId).populate(direction+'Screen')
    .exec(function(err, currentScreen) {
      if (err) {
        handleError(err, res);
      } else {
        var toSend = currentScreen[direction+'Screen'];
        if (toSend) {
          res.send(toSend)
        } else {
          res.send({error: 'no screen in that direction'});
        }
      }
    })
  },

  createPlacedScreen: function(req, res) {
    var direction = req.param('direction');
    var newScreen = sampleScreens.template;
    var currentObjectId = req.param('currentScreenId');


      res.send({success: 'World Created'}, 200);
    
      console.log(newScreen);
    // create new screen
    Screen.createAsync(newScreen)
    .then(function(createdScreen) {
      return helpers.addDirectionReference(direction, currentObjectId, createdScreen._id)
    })
    // go around the horn, adding all necessary references
    .then(function(createdScreenId) {
      return helpers.placementHelper(currentObjectId, createdScreenId, direction, adjacentDirections[direction]);
    })
    // when not creating world
    .then(function() {
      res.send({success: 'World Created'}, 200);
    })
    .catch(function(err) {
      console.log('world probably created already');
      handleError(err, res);
    });
  },

  getScreen: function(req, res) {
    var screenId = req.param('screenId');
    Screen.findByIdAsync(screenId)
    .then(function(foundScreen) {
      res.send(foundScreen);
    })
    .catch(function(err) {
      console.log('didnt find it', err);
      handleError(err, res);
    });
  },

  deleteScreen: function(req, res) {
    var screenId = req.param('screenId');

    Screen.findByIdAndRemove(screenId)
    .then(function(deletedScreen) {
      res.send({success: true, deletedScreen: deletedScreen});
    })
    .catch(function(err) {
      handleError(err, res);
    })
  },

  saveScreen: function(req, res) {
    var map = JSON.parse(req.body.map);
    delete map._id;
    var screenId = req.param('screenId');
    console.log('updating MAP: ', typeof map);
    // JSON.parse(map);

    Screen.findByIdAndUpdate(screenId, map, function(err, result) {
      if (err) {
        console.log('You fucked uppp', err);
        res.send(500);
      } else {
        console.log('Updated map');
        res.send(200);
      }
    });
  },

  saveTileSet = function(req, res) {
    // var data = req.body.data;
    var filePath = path.join(__dirname, 'app/assets/tilemaps/tiles/');
    req.pipe(filePath);

    req.on('end', function() {
      console.log('uploaded?', filePath);
      res.send('uploaded!');
    });
  }
};
