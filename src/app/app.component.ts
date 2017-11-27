import { Component, OnInit } from '@angular/core';

import { scaleLinear} from 'd3-scale';
import { select } from 'd3-selection';
import { timeYear } from 'd3-time';
import { range } from 'd3-array';
import * as d3 from 'd3';
import { line } from 'd3-shape';
import {interpolate} from 'd3-interpolate';
import { axisBottom, axisLeft } from "d3-axis";
import { easeLinear } from "d3-ease";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  width: number;
  height: number;
  duration = 1485;
  limit = 60 * 1;
  now: Date;
  groups: any;
  x: any;
  y: any;
  line: any;
  axis: any;
  paths;
  svg: any;
  yMax = 200;
  margin: any = {top: 20, right: 0, bottom: 30, left: 0};
  container: any;
  g: any;
  xAxis: any;
  yAxis: any;
  lastValue = 10;
  audio: any;
  greater: boolean;

  generateValue(self): number {
    // return Math.random() * self.lastValue + 20;

    const shift = Math.random() * 90;

    if (shift <= 20) {
      return Math.random() * this.yMax;
    } else if (shift > 30) {
      return Math.random() * self.lastValue + 20;
    } else if (shift > 20) {
      return Math.random() * self.lastValue + 40;
    }


  }

  playAudio(audio: any) {
    audio.play();
  }

  setAudio() {
    const self = this;
    let audio;

    if (this.greater) {
      audio = new Audio('./assets/shepard_ton2.mp3');
    } else {
      audio = new Audio('./assets/shepard_ton2_desc.mp3');
    }


    setTimeout(function() {
      self.playAudio(audio);
    }, self.duration);
  }

  tick(self) {
    self.now = new Date();
    // Add new values
    for (const key in self.groups) {
      if (self.groups.hasOwnProperty(key)) {
        const group = self.groups[key];
        // group.data.push(group.value) // Real values arrive at irregular intervals
        // const newValue = Math.random() * this.yMax
        let newValue = self.generateValue(self);

        if (newValue > self.yMax) {
          newValue = self.generateValue(self);
        }



        // console.log(newValue, self.lastValue);
        if (newValue > self.lastValue) {
          self.greater = true;
        } else {
          self.greater = false;
        }

        self.lastValue = newValue;
        group.data.push(newValue);
        group.path.attr('d', self.line);
      }
    }

    // if (this.audio) {
    //   // this.audio.pause();
    // }
    //
    // Shift domain
    self.x.domain([<any>self.now - (self.limit - 2) * self.duration, <any>self.now - self.duration]);

    // // Slide x-axis left
    self.g.select('.x.axis').transition()
      .duration(self.duration)
      .ease(easeLinear)
      .call(self.xAxis);
    // self.playAudio();
    // Slide paths left
    self.paths.attr('transform', null)
      .transition()
      .duration(self.duration)
      .ease(easeLinear)
      .attr('transform', 'translate(' + self.x(<any>self.now - (self.limit - 1) * self.duration) + ')')
      .on('end', function() {
        self.setAudio();
        self.tick(self);
      })
      .on('start', function() {
        // self.playAudio();
      })


    // Remove oldest data point from each group
    for (const key in self.groups) {
      if (self.groups.hasOwnProperty(key)) {
        const group = self.groups[key];
        group.data.shift();
      }
    }
  }


  setupGraph() {

    this.container = select('#graph_container');
    const containerNode: any = this.container.node();
    const dimensions = containerNode.getBoundingClientRect();

    this.width = dimensions.width - this.margin.left - this.margin.right;
    this.height = dimensions.height - this.margin.bottom - this.margin.top;

    this.x = scaleLinear()
      .domain([<any>this.now - (this.limit - 2), (<any>this.now - this.duration)])
      .range([0, this.width]);

    this.y = scaleLinear()
      .domain([0, this.yMax])
      .range([this.height, 0]);

    this.xAxis = axisBottom(this.x)
      .tickFormat(d3.timeFormat('%S'))
    this.yAxis = axisLeft(this.y);

  }

  ngOnInit() {
    const self = this;
    this.now = new Date(Date.now() - this.duration);
    this.setupGraph();

    this.groups = {
      // current: {
      //   value: 0,
      //   color: 'orange',
      //   data: range(self.limit).map(function() { return 0; })
      // },
      // target: {
      //   value: 0,
      //   color: 'green',
      //   data: range(self.limit).map(function() { return 0; })
      // },
      output: {
        value: 0,
        color: 'grey',
        data: range(self.limit).map(function() { return 0; })
      }
    };

    this.line = d3.line()
      .x(function(d, i) { return self.x(<any>self.now - (self.limit - 1 - i) * self.duration); })
      .y(function(d) { return self.y(d); });

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

    // this.g.append('g')
    //   .attr('class', 'y axis')
    //   .call(this.yAxis);

    this.paths = this.g.append('g');
    this.paths.attr('class', 'paths');

    for (const key in this.groups) {
      if (this.groups.hasOwnProperty(key)) {
        const group = this.groups[key];
        group.path = this.paths.append('path')
          .data([group.data])
          .attr('class', key + ' pathGroup')
          .style('stroke', group.color)
          .style('shape-rendering', 'crispEdges')
          .style('fill', 'none')
          .style('stroke-width', 2)
          .style('shape-rendering', 'auto');
      }
    }

    this.tick(this);
  }
}
