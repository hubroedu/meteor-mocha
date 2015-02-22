#/**
# * Initialize a new `Base` reporter.
# *
# * All other reporters generally
# * inherit from this reporter, providing
# * stats such as test duration, number
# * of tests passed / failed etc.
#*
#* @param {Runner} runner
#* @api public
#*/

practical.mocha ?= {}

class practical.mocha.BaseReporter

  constructor: (@runner)->
    expect(@runner).to.be.an 'object'
    @stats = { total: @runner.total, suites: 0, tests: 0, passes: 0, pending: 0, failures: 0 }
    @failures = []

    @runner.stats = @stats

    @runner.on 'start', (total)=>
      @stats.start = new Date

    @runner.on 'suite', (suite)=>
      @stats.suites++ if not suite.root

    @runner.on 'test end', (test)=>
      @stats.tests++

    @runner.on 'pass', (test)=>
      medium = test.slow() / 2
      test.speed = test.duration > test.slow() ? 'slow' : test.duration > medium ? 'medium' : 'fast'
      @stats.passes++

    @runner.on 'fail', (test, err)=>
      @stats.failures++;
      test.err = err
      @failures.push(test)

    @runner.on 'end', =>
      @stats.end = new Date
      @stats.duration = @stats.end - @stats.start

    @runner.on 'pending', =>
      @pending++
