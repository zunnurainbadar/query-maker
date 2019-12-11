# Query Maker

<!-- [![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger) -->
Query maker is a simple tool with 0 dependency package for making sql queries from data in the form of objects and arrays.


## Installation

```
$ npm install query-maker

```
or

```
$ yarn add query-maker

```

**Examples**
> **Select**

**Simple Select**
```js
const queryMaker = require('query-maker'); 
let options = {
    table:tableName
}
let result = queryMaker.getSelectQuery(options);
console.log(result)
//result 
{ 
query:'SELECT  *  FROM tableName ',
values: [] 
}
```
**Where Condition**
```js
const queryMaker = require('query-maker'); 
let options = {
    table:tableName,
    data:[],
    condition:{"fieldOne":1}
}
let result = queryMaker.getSelectQuery(options);
console.log(result)
//result 
{ 
query:'SELECT  *  FROM tableName  WHERE fieldOne=$1',
values: [ 1 ] 
}
```
**AND**
```js
const queryMaker = require('query-maker'); 
let options = {
    table:"tableName",
    data:[],
    condition:[{"fieldOne":2,"fieldTwo":3}]
}
let result = queryMaker.getSelectQuery(options);
console.log(result)
//result 
{ 
    query: 'SELECT  *  FROM tableName  WHERE (fieldOne=$1 AND fieldTwo=$2)',
    values: [ 2, 3 ] 
}
```
**OR**
```js
const queryMaker = require('query-maker'); 
let options = {
    table:"tableName",
    data:[],
    condition:[{"fieldOne":2},{"fieldTwo":3}]
}
let result = queryMaker.getSelectQuery(options);
console.log(result)
//result 
{ 
    query: 'SELECT  *  FROM tableName  WHERE (fieldOne=$1) OR (fieldTwo=$2)',
    values: [ 2, 3 ] 
}
``` 
**Where Condition with AND and OR**
```js
const queryMaker = require('query-maker'); 
let options = {
    table:"tableName",
    data:[],
    condition:[{"fieldOne":2,"fieldTwo":3},{"fieldThree":4}]
}
let result = queryMaker.getSelectQuery(options);
console.log(result)
//result 
{ 
    query:'SELECT  *  FROM tableName  WHERE (fieldOne=$1 AND fieldTwo=$2) OR (fieldThree=$3)',
    values: [ 2, 3, 4 ] }
``` 
**Joins**
```js
const queryMaker = require('query-maker'); 
let options = {
    table:"tableName1 table1",
    data:[{"fieldOne":"table1.fieldOne"}],
    join:[{type:"inner",table:"tableName2 table2",condition:{"table1.fieldOne":1,"table2.fieldTwo":3}}],
    condition:{"table2.fieldOne":2}
}
let result = queryMaker.getSelectQuery(options);
console.log(result)
//result 
{ 
    query:'SELECT table1.fieldOne as fieldOne FROM tableName1 table1 inner join     tableName2 table2 on table1.fieldOne=$1 AND table2.fieldTwo=$2 WHERE table2.fieldOne=$3',
    values: [ 1, 3, 2 ] 
}
``` 
**Order By**
```js
const queryMaker = require('query-maker'); 
let options = {
    data:[],
    table:"tableName",
    orderBy:['fieldOne']
}
let result = queryMaker.getSelectQuery(options);
console.log(result)
//result 
{ 
    query: 'SELECT  *  FROM tableName  Order BY fieldOne',
    values: [] 
}
``` 
**Group By**
```js
const queryMaker = require('query-maker'); 
let options = {
    data:{"fieldOne":"fieldOne","count":"count(fieldTwo)"},
    table:"tableName",
    groupBy:['fieldOne']
}
let result = queryMaker.getSelectQuery(options);
console.log(result)
//result 
{ 
    query:'SELECT fieldOne as fieldOne,count(fieldTwo) as count FROM tableName  Group BY fieldOne',
    values: [] 
}
``` 
**Limit**
```js
const queryMaker = require('query-maker'); 
let options = {
    data:{"fieldOne":"fieldOne"},
    table:"tableName",
    limit:10
}
let result = queryMaker.getSelectQuery(options);
console.log(result)
//result 
{ 
    query:'SELECT fieldOne as fieldOne,count(fieldTwo) as count FROM tableName  Limit 10',
    values: [] 
}
``` 
**Offset**
```js
const queryMaker = require('query-maker'); 
let options = {
    data:{"fieldOne":"fieldOne"},
    table:"tableName",
    offset:10
}
let result = queryMaker.getSelectQuery(options);
console.log(result)
//result 
{ 
    query: 'SELECT fieldOne as fieldOne FROM tableName  Offset 10',
    values: [] 
}
```
> **Insert**

**Single Insert**
```js
const queryMaker = require('query-maker'); 
let options = {
    table:"tableName",
    data:{"fieldOne":1,"fieldTwo":2}
}
let result = queryMaker.getInsertQuery(options);
console.log(result)
//result 
{ 
    query: 'INSERT INTO tableName (fieldOne,fieldTwo) VALUES ($1,$2)',
    values: [ 1, 2 ] 
}
```
**Multiple Insert**
```js
const queryMaker = require('query-maker'); 
let options = {
    table:"tableName",
    data:[{"fieldOne":1,"fieldTwo":2},{"fieldOne":3,"fieldTwo":4}]
}
let result = queryMaker.getInsertQuery(options);
console.log(result)
//result 
{ 
    query:'INSERT INTO tableName (fieldOne,fieldTwo) VALUES ($1,$2),($3,$4)',
    values: [ 1, 2, 3, 4 ] 
}
```
> **Update**

**Simple Update**
```js
const queryMaker = require('query-maker'); 
let options = {
    table:"tableName",
    data:{"fieldOne":1,"fieldTwo":2},
    condition:{"fieldOne":3}
}
let result = queryMaker.getUpdateQuery(options);
console.log(result)
//result 
{ 
    query:'UPDATE tableName SET fieldOne=$1,fieldTwo=$2 WHERE fieldOne=$3',
    values: [ 1, 2, 3 ] 
}
```
> **Delete**

**Simple Delete**
```js
const queryMaker = require('query-maker'); 
let options = {
    table:"tableName",
    condition:{"fieldOne":3}
}
let result = queryMaker.getUpdateQuery(options);
console.log(result)
//result 
{ query: 'DELETE FROM tableName WHERE fieldOne=$1',
  values: [ 3 ] 
}
```