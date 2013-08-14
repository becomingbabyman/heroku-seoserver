#!/usr/bin/env ruby -w

require 'csv'
require 'json'

FILENAME = File.expand_path('~/Downloads/state_of_the_stack_nodejs.csv')

class PackageCounts
  def initialize
    @versions = Hash.new([])
    @counts = Hash.new(0)
  end

  def update!(entry)
    (count, value) = entry

    value = normalize(value) unless value =~ /\"/
    (name, semvers) = JSON.parse(value)

    @counts[name]   += count.to_i
    @versions[name] += semvers.split(', ')
  end

  def print_report(verbose = false)
    @counts.sort { |a,b| a[1] <=> b[1] }.reverse.each do |value|
      (name, count) = value
      print "#{count} #{name}"
      print " #{@versions[name].sort.uniq.join(', ')}" if verbose
      puts
    end
  end

  private

  def normalize(value)
    match = value.match(/^\[([^,]+), (.+)\]$/)
    "[\"#{match[1]}\", \"#{match[2]}\"]"
  end
end

counts = PackageCounts.new

# no point in putting I/O in a class / module
File.open(FILENAME) do |file|
  line = ''

  while not line =~ /^Packages$/ do
    line = file.readline
  end

  # discard header row
  file.readline

  while line = file.readline do
    break if line =~ /^\s*$/

      CSV.parse(line) { |entry| counts.update!(entry) }
  end
end

counts.print_report
