# Query Maker

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
**Select Some Columns**
You can select some of the data by providing data Option. You have to provide an object or array of objects. Object key will be the alias and Object value will be your column name in your DB or any aggregate function. 
```js
const queryMaker = require('query-maker'); 
let options = {
    table:tableName,
     data:[{"field1":"fieldOne"}]
}
let result = queryMaker.getSelectQuery(options);
console.log(result)
//result 
{ 
query:'SELECT  fieldOne as field1  FROM tableName ',
values: [] 
}
```
**Where Condition**
For AND Operator you have to put all conditions inside an object and for OR operator you have to put condition objects inside an Array. For Example:
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
**AND with OR**
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
You can match join coniditions by value and by reference. To match condition by value you have to enclose your value in ''.

Match data by reference in join conditions
```js
const queryMaker = require('query-maker'); 
let options = {
    table:"tableName1 table1",
    data:[{"fieldOne":"table1.fieldOne"}],
    join:[{type:"inner",table:"tableName2 table2",condition:{"table2.fieldTwo":"table1.fieldOne"}}],
    condition:{"table2.fieldOne":2}
}
let result = queryMaker.getSelectQuery(options);
console.log(result)
//result 
{ 
    query:'SELECT table1.fieldOne as id FROM tableName1 table1 inner join tableName2 table2 on table2.fieldTwo=table1.fieldOne WHERE table2.fieldOne=$1',
    values: [ 2 ]
}
```
Match data by value in join conditions
```js
const queryMaker = require('query-maker');
let options = {
    table:"tableName1 table1",
    data:[{"fieldOne":"table1.fieldOne"}],
    join:[{type:"left",table:"tableName2 table2",condition:{"table2.fieldOne":"'Text'"}}],
    condition:{"table2.fieldTwo":2}
}
let result = queryMaker.getSelectQuery(options);
console.log(result)
{ 
    query:'SELECT table1.fieldOne as fieldOne FROM tableName1 table1 right join tableName2 table2 on table2.fieldOne='Text' WHERE table2.fieldTwo=$1',
    values: [ 2 ] 
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
let result = queryMaker.getDeleteQuery(options);
console.log(result)
//result 
{ query: 'DELETE FROM tableName WHERE fieldOne=$1',
  values: [ 3 ] 
}
```

> **Options**

**Insert Options**
| Option        | Type           | Description     |
| ------------- | -------------  | -------------   |
| table         | String         | Table Name      |
| data          | Object Or Array| Date to Insert |

**Select Options**
| Option        | Type            | Description                     |
| ------------- | -------------   | -------------                   |
| table         | String          | Table Name                      |
| data          | Object Or Array | Column names in select of query |
| join          | Object Or Array | Joins in a query                |
| condition     | Object Or Array | Where conditions in a query     |
| orderBy       | Array           | Column Names for Ordering       |
| groupBy       | Array           | Column Names for Grouping       |
| limit         | Integer         | Number of Records to get        |
| offset        | Integer         | Number of Records to skip       |

**Join Options**

| Option        | Type           | Description       |
| ------------- | -------------  | -------------     |
| table         | String         | Table Name        |
| type          | String         | Type Of Join      |
| condition     | Object Or Array| Condition Of Join |

**Update Options**
| Option        | Type           | Description                 |
| ------------- | -------------  | -------------               |
| table         | String         | Table Name                  |
| data          | Object         | Data to Update              |
| condition     | Object Or Array| Where conditions in a query |

**Delete Options**
| Option        | Type          | Description                  |
| ------------- | ------------- | -------------                |
| table         | String        | Table Name                   |
| condition     | Object Or Array| Where conditions in a query |

