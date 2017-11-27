import { Component, OnInit } from '@angular/core';

import { scaleLinear} from 'd3-scale';
import { select } from 'd3-selection';
import { timeYear } from 'd3-time';
import { range } from 'd3-array';
import * as d3 from 'd3';
import {line} from 'd3-shape';
import {interpolate} from 'd3-interpolate';
import { axisBottom, axisLeft } from "d3-axis";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  width: number;
  height: number;
  duration = 750;
  limit = 60 * 1;
  now: Date;
  groups: any;
  x: any;
  y: any;
  line: any;
  axis: any;
  paths;
  svg: any;
  margin: any = {top: 20, right: 10, bottom: 30, left: 30};
  container: any;
  g: any;
  xAxis: any;
  yAxis: any;


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
    this.x.domain([<any>this.now - (this.limit - 2) * this.duration, <any>this.now - this.duration]);

    // Slide x-axis left
    this.g.select('.x.axis').transition()
      .duration(this.duration)
      // .ease('linear')
      .call(this.xAxis);

    // Slide paths left
    this.g.select('paths').attr('transform', null)
      .transition()
      .duration(this.duration)
      // .ease('linear')
      .attr('transform', 'translate(' + this.x(<any>this.now - (this.limit - 1) * this.duration) + ')')
      .each('end', this.tick);
    console.log('poop')
    // Remove oldest data point from each group
    for (const name of this.groups) {
      const group = this.groups[name];
      group.data.shift();
    }
  }


  setupGraph() {
    this.container = select('#container');
    const containerNode: any = this.container.node();
    const dimensions = containerNode.getBoundingClientRect();

    this.width = dimensions.width - this.margin.left - this.margin.right;
    this.height = dimensions.height - this.margin.bottom - this.margin.top;

    this.x = scaleLinear()
      .domain([<any>this.now - (this.limit - 2), (<any>this.now - this.duration)])
      .range([0, this.width]);

    this.y = scaleLinear()
      .domain([0, 100])
      .range([this.height, 0]);

    this.xAxis = axisBottom(this.x);
    this.yAxis = axisLeft(this.y);

  }

  ngOnInit() {
    this.now = new Date(Date.now() - this.duration);

    this.setupGraph();

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
        data: range(this.limit).map(function() { return 0; })
      },
      output: {
        value: 0,
        color: 'grey',
        data: range(this.limit).map(function() { return 0; })
      }
    };

    this.line = d3.line()
      .x(function(d, i) {
          return this.x(<any>this.now - (this.limit - 1 - i) * this.duration);
      })
      .y(function(d) { return this.y(d); });

    this.svg = this.container.append('svg')
      .attr('id', 'chart')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.g = this.svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');


    this.g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(this.xAxis);

    this.g.append('g')
      .attr('class', 'y axis')
      .call(this.yAxis);

    this.paths = this.g.append('g')
      .attr('class', 'paths');

    for (const key in this.groups) {
      if (this.groups.hasOwnProperty(key)) {
        const group = this.groups[key];
        group.path = this.paths.append('path')
          .data([group.data])
          .attr('class', name + ' group')
          .style('stroke', group.color);
      }
    }

    this.tick();
  }
}
