import { Component, OnInit } from '@angular/core';

import { scaleLinear} from 'd3-scale';
import { select } from 'd3-selection';
import { timeYear } from 'd3-time';
import { range } from 'd3-array';
// import * as d3 from 'd3';
import {line} from 'd3-shape';
import {interpolate} from 'd3-interpolate';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  width = 500;
  height = 200;
  duration = 750;
  limit = 60;
  now: Date;
  groups: any;
  x: any;
  y: any;
  line: any;
  axis: any;
  paths;
  svg: any;

  tick() {
    this.now = new Date();
    // Add new values
    for (const name of this.groups) {
      const group = this.groups[name];
      // group.data.push(group.value) // Real values arrive at irregular intervals
      group.data.push(20 + Math.random() * 100);
      group.path.attr('d', this.line);
    }

    // Shift domain
    this.x.domain([<any>this.now - (this.limit - 2) * this.duration, <any>this.now - this.duration])

    // Slide x-axis left
    this.axis.transition()
        .duration(this.duration)
        .ease('linear')
        .call(this.x.axis)

    // Slide paths left
    this.paths.attr('transform', null)
        .transition()
        .duration(this.duration)
        .ease('linear')
        .attr('transform', 'translate(' + this.x(<any>this.now - (this.limit - 1) * this.duration) + ')')
        .each('end', this.tick);

    // Remove oldest data point from each group
    for (const name of this.groups) {
        const group = this.groups[name]
        group.data.shift();
    }
  }


  ngOnInit() {
    console.log('turtles');

    // let limit = 60 * 1;
    // let duration = 750;
    this.now = new Date(Date.now() - this.duration);

    this.groups = {
      current: {
        value: 0,
        color: 'orange',
        data: range(this.limit).map(function() {
            return 0;
        })
      },
      target: {
          value: 0,
          color: 'green',
          data: range(this.limit).map(function() {
              return 0;
          })
      },
      output: {
          value: 0,
          color: 'grey',
          data: range(this.limit).map(function() {
              return 0;
          })
      }
    }

    this.x = scaleLinear()
        .domain([<any>this.now - (this.limit - 2), (<any>this.now - this.duration)])
        .range([0, this.width])

    this.y = scaleLinear()
        .domain([0, 100])
        .range([this.height, 0])

    this.line = d3.line()
        .x(function(d, i) {
            return this.x(<any>this.now - (this.limit - 1 - i) * this.duration);
        })
        .y(function(d) {
            return this.y(d);
        });

    this.svg = select('.graph').append('svg')
        .attr('class', 'chart')
        .attr('width', this.width)
        .attr('height', this.height + 50)

    this.axis = this.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + this.height + ')')
        .call(this.x.axis = this.svg.axis().scale(this.x).orient('bottom'))

    this.paths = this.svg.append('g')

    for (let group of this.groups) {
      // let group = groups[name]
      group.path = this.paths.append('path')
        .data([group.data])
        .attr('class', name + ' group')
        .style('stroke', group.color);
    }

    this.tick();
  }
}
