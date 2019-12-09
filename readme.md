# Query Maker

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)
Query maker is a simple tool for making sql queries from data in the form of objects and arrays.

**Examples**
**Select:**
```js
const queryMaker = require('query-maker'); 
let options = {
    table:tableName
}
let result = queryMaker.getSelectQuery(options);
console.log(result)
//result 
{ 
query:'SELECT  *  FROM abc_table ',
values: [] 
}
```
```js
const queryMaker = require('query-maker'); 
let options = {
    table:tableName,
    data:[],
    condition:{a:1}
}
let result = queryMaker.getSelectQuery(options);
console.log(result)
//result 
{ 
query:'SELECT  *  FROM abc_table  WHERE a=$1',
values: [ 1 ] 
}
```
    

**API**
