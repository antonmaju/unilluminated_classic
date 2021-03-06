module.exports =(function(){

    var GameUtils = require('../commonUtils'),
        event = require('events'),
        astar = require('./astar');


    /**
     * This class is responsible for chase AI
     * @param {Object} options
     * @constructor
     */
    function ChaseBehavior(options){
        event.EventEmitter.call(this);

        var defaults = {
            sightRadius:10,
            widthSize:1,
            heightSize:1
        };

        this.options = GameUtils.extends({}, defaults, options);

        this._path = [];
        this._pathIndex =0;

        if(typeof(Modernizr) != "undefined" && Modernizr.webworkers)
            this._worker = new Worker('/js/astarWorker.min.js');

        this._init();
    }

    ChaseBehavior.prototype = Object.create(event.EventEmitter.prototype);

    /**
     * Sets current map
     * @param {object} map
     */
    ChaseBehavior.prototype.setMap = function(map){
        this._map = map;
        this.reset();
    };

    /***
     * Sets current position information
     * @param {object} pos
     */
    ChaseBehavior.prototype.setPosition= function(pos){
        this._position = pos;
        this.reset();
    };

    /***
     * Gets current position
     * @returns {object}
     */
    ChaseBehavior.prototype.getPosition = function(){
        return this._position;
    };

    /***
     * Sets current target position
     * @param {object} pos
     */
    ChaseBehavior.prototype.setTarget = function(pos){
        this._target = pos;
        this.reset();
    };

    /**
     * Gets current target position
     * @returns {object}
     */
    ChaseBehavior.prototype.getTarget = function(){
        return this._target;
    };

    ChaseBehavior.prototype._generatePath = function(){
        if(this._worker)
        {
            this._worker.postMessage({
                grid:  this._map.grid,
                start: this._position,
                end: this._target,
                widthSize: this.options.widthSize,
                heightSize: this.options.heightSize
            });

            return;
        }

        this._path = astar(this._map.grid, this._position, this._target, this.options.widthSize, this.options.heightSize)
            || [];
        this.emit('_pathGenerated');
    };

    /**
     * Requests AI to get next position
     */
    ChaseBehavior.prototype.getNextMove = function(){
        if(this._pathIndex >= this._path.length)
            this._generatePath();
        else
            this.emit('_pathGenerated');
    };

    ChaseBehavior.prototype._init = function(){
        var self = this;

        self.on('_pathGenerated', function(){
            var nextMove = null;
            if(this._pathIndex <  this._path.length)
            {
                nextMove = this._path[this._pathIndex];
                this._position = nextMove;
                this._pathIndex++;
            }
            else
            {
                nextMove = this._position;
            }
            self.emit('nextMoveGenerated', nextMove);
        });

        if(this._worker)
        {
            this._worker.onmessage = function(evt){
                self._path = evt.data || [];
                self.emit('_pathGenerated');
            };
        }
    };

    /**
     * Resets this AI state
     */
    ChaseBehavior.prototype.reset= function(){
        this._path =[];
        this._pathIndex=0;
    };

    return ChaseBehavior;
})();