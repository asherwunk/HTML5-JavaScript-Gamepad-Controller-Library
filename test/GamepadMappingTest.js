(function() {
	'use strict';

	var buster = require('buster');
	var assert = buster.assert;

	var GamepadSimulator = require('./GamepadSimulator.js');
	var PlatformSimulator = require('./PlatformSimulator.js');
	var GamepadUser = require('./GamepadUser.js');

	function probeControls(test) {
		var i;
		var buttons = test.gamepad.buttons;
		var axes = test.gamepad.axes;

		for (i = 0; i < buttons.length; i++) {
			buttons[i] = 1.0;
			test.updater.update();
			buttons[i] = 0.0;
		}
		for (i = 0; i < axes.length; i++) {
			axes[i] = 1.0;
			test.updater.update();
			axes[i] = 0.0;
		}
	}

	/**
	 * Tests the report of BUTTON_DOWN with control names for buttons.
	 * The method first iterates from 0..N of all gamepad buttons and fires them,
	 * then does the same for all axes.
	 *
	 * @param {Object} test the buster test to run in
	 * @param {Array} expected the expected list of buttons to be reported
	 */

	function buttonsTest(test, expected) {
		var result = [];

		test.user.onButtonDown = function(data) {
			result.push(data.control);
		};
		probeControls(test);

		assert.equals(result, expected);
	}

	/**
	 * Tests the report of AXIS_CHANGED with control names for axes.
	 * The method first iterates from 0..N of all gamepad buttons and fires them,
	 * then does the same for all axes.
	 *
	 * @param {Object} test the buster test to run in
	 * @param {Array} expected the expected list of axes to be reported
	 */

	function axesTest(test, expected) {
		var result = [];

		test.user.onAxisChanged = function(data) {
			if (data.value > 0.0) {
				result.push(data.axis);
			}
		};
		probeControls(test);

		assert.equals(result, expected);
	}

	buster.testCase('Gamepad Mapping', {
		setUp: function() {
			var gamepadSimulator = new GamepadSimulator();
			var that = this;

			this.gamepadSimulator = gamepadSimulator;

			this.Gamepad = require('../gamepad.js').Gamepad;

			this.PlatformFactories = this.Gamepad.PlatformFactories;
			this.Gamepad.PlatformFactories = [
				function(listener) {
					var platform = that.platform = new PlatformSimulator(listener);

					return platform;
				}
			];

			this.updater = new this.Gamepad.UpdateStrategies.ManualUpdateStrategy();

			this.obj = new this.Gamepad(this.updater);
			this.user = new GamepadUser(this.Gamepad.Event, this.obj);
			this.obj.init();

		},

		tearDown: function() {
			this.Gamepad.PlatformFactories = this.PlatformFactories;
		},

		'XBOX controller': {

			setUp: function() {
				this.gamepad = this.gamepadSimulator.addGamepad(0, 'xbox gamepad', 17);
				this.platform.listener._connect(this.gamepad);
			},

			'should have all buttons mapped': function() {
				buttonsTest(this, ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LEFT_TRIGGER', 'RIGHT_TRIGGER',
					'BACK', 'START', 'LEFT_STICK', 'RIGHT_STICK',
					'DPAD_UP', 'DPAD_DOWN', 'DPAD_LEFT', 'DPAD_RIGHT',
					'HOME'
				]);
			},

			'should have all axes mapped': function() {
				axesTest(this, ['LEFT_STICK_X', 'LEFT_STICK_Y', 'RIGHT_STICK_X', 'RIGHT_STICK_Y']);
			}
		},

		'Logitech controller on WebKit': {
			setUp: function() {
				this.gamepad = this.gamepadSimulator.addGamepad(0, 'logitech gamepad');
				this.platform.mapping = this.Gamepad.Mapping.LOGITECH_WEBKIT;
				this.platform.listener._connect(this.gamepad);
			},

			'should have all buttons mapped': function() {
				// TODO: This can't be right - LEFT/RIGHT_STICK have same mappings as HOME/DPAD_UP
				buttonsTest(this, ['X', 'A', 'B', 'Y', 'LB', 'RB', 'LEFT_TRIGGER', 'RIGHT_TRIGGER',
					'BACK', 'START', 'LEFT_STICK', 'HOME', 'RIGHT_STICK', 'DPAD_UP', 'DPAD_DOWN', 'DPAD_LEFT',
					'DPAD_RIGHT'
				]);
			},

			'should have all axes mapped': function() {
				axesTest(this, ['LEFT_STICK_X', 'LEFT_STICK_Y', 'RIGHT_STICK_X', 'RIGHT_STICK_Y']);
			}
		},

		'Logitech controller on Firefox': {
			setUp: function() {
				this.gamepad = this.gamepadSimulator.addGamepad(0, 'logitech gamepad');
				this.platform.mapping = this.Gamepad.Mapping.LOGITECH_FIREFOX;
				this.platform.listener._connect(this.gamepad);
			},

			'should have all buttons mapped': function() {
				buttonsTest(this, ['A', 'B', 'X', 'Y', 'LB', 'RB',
					'BACK', 'START', 'LEFT_STICK', 'RIGHT_STICK', 'HOME',
					'DPAD_UP', 'DPAD_DOWN', 'DPAD_LEFT', 'DPAD_RIGHT'
				]);
			},

			'should have all axes mapped': function() {
				axesTest(this, ['LEFT_STICK_X', 'LEFT_STICK_Y', 'LEFT_TRIGGER', 'RIGHT_STICK_X']);
			}
		},

		'Playstation controller on WebKit': {
			setUp: function() {
				this.gamepad = this.gamepadSimulator.addGamepad(0, 'playstation gamepad', 17);
				this.platform.mapping = this.Gamepad.Mapping.PLAYSTATION_WEBKIT;
				this.platform.listener._connect(this.gamepad);
			},

			'should have all buttons mapped': function() {
				buttonsTest(this, ['CROSS', 'CIRCLE', 'SQUARE', 'TRIANGLE', 'LB1', 'RB1', 'LB2', 'RB2',
					'SELECT', 'START', 'LEFT_STICK', 'RIGHT_STICK',
					'DPAD_UP', 'DPAD_DOWN', 'DPAD_LEFT', 'DPAD_RIGHT',
					'HOME'
				]);
			},

			'should have all axes mapped': function() {
				axesTest(this, ['LEFT_STICK_X', 'LEFT_STICK_Y', 'RIGHT_STICK_X', 'RIGHT_STICK_Y']);
			}
		},

		'Playstation controller on Firefox': {
			setUp: function() {
				this.gamepad = this.gamepadSimulator.addGamepad(0, 'playstation gamepad');
				this.platform.mapping = this.Gamepad.Mapping.PLAYSTATION_FIREFOX;
				this.platform.listener._connect(this.gamepad);
			},

			'should have all buttons mapped': function() {
				buttonsTest(this, ['SELECT', 'LEFT_STICK', 'RIGHT_STICK', 'START',
					'DPAD_UP', 'DPAD_RIGHT', 'DPAD_DOWN', 'DPAD_LEFT',
					'LB1', 'RB1',
					'TRIANGLE', 'CIRCLE', 'CROSS', 'SQUARE'
				]);
			},

			'should have all axes mapped': function() {
				axesTest(this, ['LEFT_STICK_X', 'LEFT_STICK_Y', 'RIGHT_STICK_X', 'RIGHT_STICK_Y']);
			}
		}

	});
})();
