/////////////////////////////////////////////////////////////////////////
// Docs
//Select Query
// let options = {
//     table:"abc_table"
// }
// let options = {
//     table:"abc_table",
//     condition:{a:1}
// }
let options = {
    table:"abc_table",
    data:[],
    condition:[{a:1},{d:4},{b:2,c:3}]
}
// let options = {
//     table:"abc_table",
//     data:[],
//     join:[{type:"inner",table:"def_table a",condition:{"a.asd":1,"c.asd":3}}],
//     condition:[{a:1},{d:4},{b:2,c:3}]
// }
// let options = {
//     table:"abc_table",
//     data:["a as 1","b as 2"],
//     join:[{type:"inner",table:"def_table a",condition:[{"a.asd":1,"c.asd":3},{"d.asd":2}]}],
//     condition:{a:1}
// }
// let options = {
//     table:"abc_table",
//     data:{"a":"1","b":'2'},
//     join:[{type:"inner",table:"def_table a",condition:{"a.asd":1,"c.asd":3}}],
//     condition:[{a:1},{d:4},{b:2,c:3}],
//     orderBy:['a','b'],
//     groupBy:['c','d'],
//     limit:50,
//     offset:50
// }
// let options = {
//     table:"abc_table",
//     data:{"a":"1","b":'2'},
//     join:[{type:"inner",table:"def_table a",condition:{"a.asd":1,"c.asd":3}}],
//     condition:[{a:1},{d:4},{b:2,c:3}],
//     orderBy:['a','b'],
//     groupBy:['c','d'],
//     limit:50
// }
// let options = {
//     table:"abc_table",
//     data:[{"a":1,"b":2},{"c": 3}],
//     join:[{type:"inner",table:"def_table a",condition:{"a.asd":1,"c.asd":3}}],
//     condition:[{a:1},{d:4},{b:2,c:3}],
//     orderBy:['a','b'],
//     groupBy:['c','d'],
//     limit:50,
//     offset:50
// }
getSelectQuery = (configs) =>{
    const table = configs['table'];
    const data = configs['data']?configs['data']:{};
    const condition = configs['condition']?configs['condition']:{};
    const orderBy = configs['orderBy']?configs['orderBy']:[];
    const groupBy = configs['groupBy']?configs['groupBy']:[];
    const limit = configs['limit']?configs['limit']:0;
    let joins = configs['join']?configs['join']:[];
    const offset = configs['offset']?configs['offset']:0;
    if (!table) {
        let error = new Error();
        error.code = 422;
        error.message = "Invalid Table Name";
        error.name = "Error";
        throw error;
    }
    if(typeof data !== 'object' || data === null){
        let error = new Error();
        error.code = 422;
        error.name = "Error";
        error.message = "Data must be an Obejct Or Array";
        throw error;
    }
    if(joins){
        if(!Array.isArray(joins)){
            let error = new Error();
            error.code = 422;
            error.name = "Error";
            error.message = "Joins must be an Array";
            throw error;
        }
    }
    if(orderBy){
        if(!Array.isArray(orderBy)){
            let error = new Error();
            error.code = 422;
            error.name = "Error";
            error.message = "OrderBy must be an Array";
            throw error;
        }
    }
    if(groupBy){
        if(!Array.isArray(groupBy)){
            let error = new Error();
            error.code = 422;
            error.name = "Error";
            error.message = "groupBy must be an Array";
            throw error;
        }
    }
    if(typeof limit !== "number"){
        let error = new Error();
        error.code = 422;
        error.name = "Error";
        error.message = "Limit must be a Number";
        throw error;
    }
    if(typeof offset !== "number"){
        let error = new Error();
        error.code = 422;
        error.name = "Error";
        error.message = "Offset must be a Number";
        throw error;
    }
    let condition_keys = Object.keys(condition);

    let data_keys_joined = [];
    if(Array.isArray(data)){
        for (const iterator of data) {
            for (const key in iterator) {
                if (iterator.hasOwnProperty(key)) {
                    data_keys_joined.push(`${iterator[key]} as ${key}`)
                }
            }
        }
    }else{
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                data_keys_joined.push(`${data[key]} as ${key}`)
            }
        }
    }
    data_keys_joined = data_keys_joined.length>0?data_keys_joined:' * ';
    let values = [];
    let query = `SELECT ${data_keys_joined} FROM ${table} `;
    let joins_array=[];
    let conditions=[];
    let conditions_array=[];
    let join_condition='';
    let i = 1;
    //Now add joins
    if(joins && joins.length > 0){
        for (const join of joins) {
            if(!join['type'] || !join['table'] || !Object.keys(join['condition']).length > 0 ){
                let error = new Error();
                error.code = 422;
                error.name = "Error";
                error.message = "Invalid Join";
                throw error;
            }
            conditions_array = [];
            if(Array.isArray(join['condition'])){
                for (const iterator of join['condition']) {
                    let or_conditions = [];
                    for (const key in iterator) {
                        if (typeof iterator[key] === 'undefined') {
                            let error = new Error();
                            error.code = 422;
                            error.name = "Error";
                            error.message = "Condition should not contain null or empty values";
                            throw error;
                        }
                        or_conditions.push(`${key}=$${i}`);
                        values.push(iterator[key]);
                        i++;
                    }
                    or_conditions = `(${or_conditions.join(" AND ")})`;
                    conditions_array.push(or_conditions);
                }
                join_condition = conditions_array.join(' OR ');       
            }else{
                let join_condition_keys = Object.keys(join['condition']);
                for (const key of join_condition_keys) {
                    if (typeof join['condition'][key] === 'undefined') {
                        let error = new Error();
                        error.code = 422;
                        error.name = "Error";
                        error.message = "Condition should not contain null or empty values";
                        throw error;
                    }
                    conditions_array.push(`${key}=$${i}`);
                    values.push(join['condition'][key]);
                    i++;
                }
                join_condition = conditions_array.join(' AND ');
            }
            joins_array.push(`${join['type']} join ${join['table']} on ${join_condition}`);
        } 
        query+= joins_array.join();
    }
    //Now add where clause
    if(condition_keys.length > 0){
        query+= ` WHERE `;
        if(Array.isArray(condition)){
            for (const iterator of condition) {
                let or_conditions = [];
                for (const key in iterator) {
                    if (typeof iterator[key] === 'undefined') {
                        let error = new Error();
                        error.code = 422;
                        error.name = "Error";
                        error.message = "Condition should not contain null or empty values";
                        throw error;
                    }
                    or_conditions.push(`${key}=$${i}`);
                    values.push(iterator[key]);
                    i++;
                }
                or_conditions = `(${or_conditions.join(" AND ")})`;
                conditions.push(or_conditions);
            }
            query += conditions.join(' OR ');       
        }else{
            for (const key of condition_keys) {
                if (typeof condition[key] === 'undefined') {
                    let error = new Error();
                    error.code = 422;
                    error.name = "Error";
                    error.message = "Condition should not contain null or empty values";
                    throw error;
                }
                conditions.push(`${key}=$${i}`);
                values.push(condition[key]);
                i++;
            }
            query += conditions.join(' AND ');
        }
    }
    if(groupBy  && groupBy.length > 0){
        query += ` Group BY ${groupBy.join(' , ')}`;
    }
    if(orderBy  && orderBy.length > 0){
        query += ` Order BY ${orderBy.join(' , ')}`;
    }
    if(limit){
        query += ` Limit ${limit}`;
    }
    if(offset){
        query += ` Offset ${offset}`;
    }
    console.log(query);
    const response = {
        query: query,
        values: values
    }
    return response;
}
console.log(getSelectQuery(options));
/////////////////////////////////////////////////////////////////////////
// Docs
//Insert Query
// let options = {
//     table:"abc_table",
//     data:{'asdasd':"123",a:1,b:2,c:3,d:4,e:5,f:5,g:5,h:5,i:5,j:5,k:5,l:5,m:5,n:5,o:5,p:5,q:5,r:5,s:5,t:5,u:5,v:5,w:5,x:5,y:5,z:5}
// }
// let options = {
//     table:"abc_table",
//     data:[{a:1,b:2},{a:3,b:5,b:6}]
// }
getInsertQuery = (configs)=>{
    const table = configs['table'];
    const data = configs['data']?configs['data']:{};
    if(!table){
        let error = new Error();
        error.code = 422;
        error.name = "Error";
        error.message = "Table Name cannot be Empty";
        throw error;
    }
    if (Object.keys(data).length <= 0) {
            let error = new Error();
            error.code = 422;
            error.message = "Invalid Data";
            error.name = "Error";
            throw error;
        }
        if(typeof data !== "object"){
            let error = new Error();
            error.code = 422;
            error.name = "Error";
            error.message = "Data must be an object or array";
            throw error;
        }
        if(Array.isArray(data)){
            let db_variable_names = Object.keys(data[0]);
            let parameters = [];

            let data_keys = Object.keys(data);
            let values = Object.values(data);
            let i = 1;
            let query = `INSERT INTO ${table} (${db_variable_names.join()}) VALUES `;
            //Check if all objects in array are same
            for (const iterator of data) {
                let insertions = [];
                for (const key in data[data.indexOf(iterator)]) {
                    if(!db_variable_names.includes(key)){
                        let error = new Error();
                        error.code = 422;
                        error.name = "Error";
                        error.message = "All Objects in array should contain same keys";
                        throw error;
                    }else{
                        insertions.push(`$${i}`);
                        i++;
                    }
                }
                parameters.push(`(${insertions.join()})`);
            }
            query+= parameters.join();
            const response = {
                query: query,
                values: values
            }
            return response;
        }else{
            let data_keys = Object.keys(data);
            let values = Object.values(data);
            let parameters = [];
            // let query = `INSERT INTO ${table} () VALUES ())`;
            let query = `INSERT INTO ${table} (${data_keys.join()}) VALUES `;
            let i = 1;
            let insertions = [];
            for (const key in data) {
                insertions.push(`$${i}`);
                i++;
            }
            parameters.push(`(${insertions.join()})`);
            query+= parameters.join();
            const response = {
                query: query,
                values: values
            }
            return response;
        }
}
// console.log(getInsertQuery(options));

/////////////////////////////////////////////////////////////////////////
// Docs
//Update Query
// let options = {
//     table:"abc_table",
//     data:{a:1,b:2},
//     condition:[{a:1},{d:4},{b:2,c:3}]
// }
// let options = {
//     table:"abc_table",
//     data:{a:1,b:2},
//     condition:{a:1}
// }
getUpdateQuery = (configs) =>{
    const table = configs['table'];
    const data = configs['data']?configs['data']:{};
    const condition = configs['condition']?configs['condition']:{};
    if(!table){
        let error = new Error();
        error.code = 422;
        error.name = "Error";
        error.message = "Table Name cannot be Empty";
        throw error;
    }
    if (Object.keys(data).length <= 0) {
        let error = new Error();
        error.code = 422;
        error.message = "Invalid Data";
        error.name = "Error";
        throw error;
    }
    if(typeof data !== "object" || Array.isArray(data)){
        let error = new Error();
        error.code = 422;
        error.name = "Error";
        error.message = "Data must be an object";
        throw error;
    }
    if(typeof condition != "object"){
        let error = new Error();
        error.code = 422;
        error.name = "Error";
        error.message = "Condition must be an object or array";
        throw error;
    }
    let data_keys = Object.keys(data);
    let condition_keys = Object.keys(condition);
    let values = Object.values(data);
    let updations = [];
    let conditions = [];
    let query = `UPDATE ${table} SET `;
    let i = 1;
    for (const key of data_keys) {
        updations.push(`${key}=$${i}`);
        i++;
    }
    query += updations.join();
    if(condition_keys.length > 0){
        query += ` WHERE `;
        if(Array.isArray(condition)){
            for (const iterator of condition) {
                let or_conditions = [];
                for (const key in iterator) {
                    if (typeof iterator[key] === 'undefined') {
                        let error = new Error();
                        error.code = 422;
                        error.name = "Error";
                        error.message = "Condition should not contain null or empty values";
                        throw error;
                    }
                    or_conditions.push(`${key}=$${i}`);
                    values.push(iterator[key]);
                    i++;
                }
                or_conditions = `(${or_conditions.join(" AND ")})`;
                conditions.push(or_conditions);
            }
            query += conditions.join(' OR ');
        }else{
            for (const key of condition_keys) {
                if (typeof condition[key] === 'undefined') {
                    let error = new Error();
                    error.code = 422;
                    error.name = "Error";
                    error.message = "Condition should not contain null or empty values";
                    throw error;
                }
                conditions.push(`${key}=$${i}`);
                values.push(condition[key]);
                i++;
            }
            query += conditions.join(' AND ');
        }
    }
    const response = {
        query: query,
        values: values
    }
    return response;
}
// console.log(getUpdateQuery(options));


/////////////////////////////////////////////////////////////////////////
// Docs
//Delete Query

// let options = {
//     table:"abc_table",
//     condition:{a:"a",b:"qaas'asdasd'asdasd"}
// }
// let options = {
//     table:"abc_table",
//     condition:[{a:"a",b:"qaas'asdasd'asdasd"},{c:3}]
// }

getDeleteQuery = (configs) =>{
    const table = configs['table'];
    const condition = configs['condition']?configs['condition']:{};
    if(!table){
        let error = new Error();
        error.code = 422;
        error.name = "Error";
        error.message = "Table Name cannot be Empty";
        throw error;
    }
    if(typeof condition != "object"){
        let error = new Error();
        error.code = 422;
        error.name = "Error";
        error.message = "Condition must be an object or array";
        throw error;
    }
    let condition_keys = Object.keys(condition);
    let values = [];
    let conditions = [];
    let query = `DELETE FROM ${table}`;
    let i = 1;
    if(condition_keys.length > 0){
        query+= ` WHERE `;
        if(Array.isArray(condition)){
            values = [];
            for (const iterator of condition) {
                let or_conditions = [];
                for (const key in iterator) {
                    if (typeof iterator[key] === 'undefined') {
                        let error = new Error();
                        error.code = 422;
                        error.name = "Error";
                        error.message = "Condition should not contain null or empty values";
                        throw error;
                    }
                    or_conditions.push(`${key}=$${i}`);
                    values.push(iterator[key]);
                    i++;
                }
                or_conditions = `(${or_conditions.join(" AND ")})`;
                conditions.push(or_conditions);
            }
            query += conditions.join(' OR ');       
        }else{
            values = Object.values(condition);
            for (const key of condition_keys) {
                if (typeof condition[key] === 'undefined') {
                    let error = new Error();
                    error.code = 422;
                    error.name = "Error";
                    error.message = "Condition should not contain null or empty values";
                    throw error;
                }
                conditions.push(`${key}=$${i}`);
                i++;
            }
            query += conditions.join(' AND ');
        }
    }
    const response = {
        query: query,
        values: values
    }
    return response;
}
// console.log(getDeleteQuery(options))
















//////////////////////////////////////////////////////////////////////////////////////////////////
//Old code with no functions
// getQuery = (configs) => {
//     const action = configs['action'];
//     const table = configs['table'];
//     const data = configs['data']?configs['data']:{};
//     const condition = configs['condition']?configs['condition']:{};
//     if (!table) {
//         let error = new Error();
//         error.code = 422;
//         error.message = "Invalid Table Name";
//         error.name = "Error";
//         throw error;
//     }
//     if (action == "select") {
//         if(data.length > 0 && !Array.isArray(data)){
//             let error = new Error();
//             error.code = 422;
//             error.name = "Error";
//             error.message = "Data must be an Array";
//             throw error;
//         }
//         let joins = configs['join'];
//         let condition_keys = Object.keys(condition);
//         let data_keys_joined = data.length>0?data.join():' * ';
//         let values = [];
//         let query = `SELECT ${data_keys_joined} FROM ${table} `;
//         let joins_array=[];
//         let conditions=[];
//         let conditions_array=[];
//         let join_condition='';
//         let i = 1;
//         //Now add joins
//         for (const join of joins) {
//             if(!join['type'] || !join['table'] || !Object.keys(join['condition']).length > 0 ){
//                 let error = new Error();
//                 error.code = 422;
//                 error.name = "Error";
//                 error.message = "Invalid Join";
//                 throw error;
//             }
//             conditions_array = [];
//             if(Array.isArray(join['condition'])){
//                 for (const iterator of join['condition']) {
//                     let or_conditions = [];
//                     for (const key in iterator) {
//                         if (typeof iterator[key] === 'undefined') {
//                             let error = new Error();
//                             error.code = 422;
//                             error.name = "Error";
//                             error.message = "Condition should not contain null or empty values";
//                             throw error;
//                         }
//                         or_conditions.push(`${key}=$${i}`);
//                         values.push(iterator[key]);
//                         i++;
//                     }
//                     or_conditions = `(${or_conditions.join(" AND ")})`;
//                     conditions_array.push(or_conditions);
//                 }
//                 join_condition = conditions_array.join(' OR ');       
//             }else{
//                 let join_condition_keys = Object.keys(join['condition']);
//                 for (const key of join_condition_keys) {
//                     if (typeof join['condition'][key] === 'undefined') {
//                         let error = new Error();
//                         error.code = 422;
//                         error.name = "Error";
//                         error.message = "Condition should not contain null or empty values";
//                         throw error;
//                     }
//                     conditions_array.push(`${key}=$${i}`);
//                     values.push(join['condition'][key]);
//                     i++;
//                 }
//                 join_condition = conditions_array.join(' AND ');
//             }
//             joins_array.push(`${join['type']} join on ${join_condition}`);
//         } 
//         query+= joins_array.join();
//         query+= ` WHERE `;
//         //Now add where clause
//         if(condition_keys.length > 0){
//             if(Array.isArray(condition)){
//                 for (const iterator of condition) {
//                     let or_conditions = [];
//                     for (const key in iterator) {
//                         if (typeof iterator[key] === 'undefined') {
//                             let error = new Error();
//                             error.code = 422;
//                             error.name = "Error";
//                             error.message = "Condition should not contain null or empty values";
//                             throw error;
//                         }
//                         or_conditions.push(`${key}=$${i}`);
//                         values.push(iterator[key]);
//                         i++;
//                     }
//                     or_conditions = `(${or_conditions.join(" AND ")})`;
//                     conditions.push(or_conditions);
//                 }
//                 query += conditions.join(' OR ');       
//             }else{
//                 for (const key of condition_keys) {
//                     if (typeof condition[key] === 'undefined') {
//                         let error = new Error();
//                         error.code = 422;
//                         error.name = "Error";
//                         error.message = "Condition should not contain null or empty values";
//                         throw error;
//                     }
//                     conditions.push(`${key}=$${i}`);
//                     values.push(condition[key]);
//                     i++;
//                 }
//                 query += conditions.join(' AND ');
//             }
//         }
//         const response = {
//             query: query,
//             values: values
//         }
//         return response;
//     }else if (action == "insert") {
//         if (Object.keys(data).length <= 0) {
//             let error = new Error();
//             error.code = 422;
//             error.message = "Invalid Data";
//             error.name = "Error";
//             throw error;
//         }
//         if(typeof data !== "object"){
//             let error = new Error();
//             error.code = 422;
//             error.name = "Error";
//             error.message = "Data must be an object or array";
//             throw error;
//         }
//         if(Array.isArray(data)){
//             let db_variable_names = Object.keys(data[0]);
//             let parameters = [];

//             let data_keys = Object.keys(data);
//             let values = Object.values(data);
//             let i = 1;
//             let query = `INSERT INTO ${table} (${db_variable_names.join()}) VALUES `;
//             //Check if all objects in array are same
//             for (const iterator of data) {
//                 let insertions = [];
//                 for (const key in data[data.indexOf(iterator)]) {
//                     if(!db_variable_names.includes(key)){
//                         let error = new Error();
//                         error.code = 422;
//                         error.name = "Error";
//                         error.message = "All Objects in array should contain same keys";
//                         throw error;
//                     }else{
//                         insertions.push(`$${i}`);
//                         i++;
//                     }
//                 }
//                 parameters.push(`(${insertions.join()})`);
//             }
//             query+= parameters.join();
//             const response = {
//                 query: query,
//                 values: values
//             }
//             return response;
//         }else{
//             let data_keys = Object.keys(data);
//             let values = Object.values(data);
//             let parameters = [];
//             // let query = `INSERT INTO ${table} () VALUES ())`;
//             let query = `INSERT INTO ${table} (${data_keys.join()}) VALUES `;
//             let i = 1;
//             let insertions = [];
//             for (const key in data) {
//                 insertions.push(`$${i}`);
//                 i++;
//             }
//             parameters.push(`(${insertions.join()})`);
//             query+= parameters.join();
//             const response = {
//                 query: query,
//                 values: values
//             }
//             return response;
//         }
//     }else if (action == "update") {
//         if (Object.keys(data).length <= 0) {
//             let error = new Error();
//             error.code = 422;
//             error.message = "Invalid Data";
//             error.name = "Error";
//             throw error;
//         }
//         if(typeof data !== "object" || Array.isArray(data)){
//             let error = new Error();
//             error.code = 422;
//             error.name = "Error";
//             error.message = "Data must be an object";
//             throw error;
//         }
//         if(typeof condition != "object"){
//             let error = new Error();
//             error.code = 422;
//             error.name = "Error";
//             error.message = "Condition must be an object or array";
//             throw error;
//         }
//         let data_keys = Object.keys(data);
//         let condition_keys = Object.keys(condition);
//         let values = Object.values(data);
//         let updations = [];
//         let conditions = [];
//         let query = `UPDATE ${table} SET `;
//         let i = 1;
//         for (const key of data_keys) {
//             updations.push(`${key}=$${i}`);
//             i++;
//         }
//         query += updations.join();
//         if(condition_keys.length > 0){
//             query += ` WHERE `;
//             if(Array.isArray(condition)){
//                 for (const iterator of condition) {
//                     let or_conditions = [];
//                     for (const key in iterator) {
//                         if (typeof iterator[key] === 'undefined') {
//                             let error = new Error();
//                             error.code = 422;
//                             error.name = "Error";
//                             error.message = "Condition should not contain null or empty values";
//                             throw error;
//                         }
//                         or_conditions.push(`${key}=$${i}`);
//                         values.push(iterator[key]);
//                         i++;
//                     }
//                     or_conditions = `(${or_conditions.join(" AND ")})`;
//                     conditions.push(or_conditions);
//                 }
//                 query += conditions.join(' OR ');
//             }else{
//                 for (const key of condition_keys) {
//                     if (typeof condition[key] === 'undefined') {
//                         let error = new Error();
//                         error.code = 422;
//                         error.name = "Error";
//                         error.message = "Condition should not contain null or empty values";
//                         throw error;
//                     }
//                     conditions.push(`${key}=$${i}`);
//                     i++;
//                 }
//                 query += conditions.join(' AND ');
//             }
//         }
//         const response = {
//             query: query,
//             values: values
//         }
//         return response;
//     }else if (action == "delete") {
//         if(typeof condition != "object"){
//             let error = new Error();
//             error.code = 422;
//             error.name = "Error";
//             error.message = "Condition must be an object or array";
//             throw error;
//         }
//         let condition_keys = Object.keys(condition);
//         let values;
//         let conditions = [];
//         let query = `DELETE FROM ${table} WHERE `;
//         let i = 1;
//         if(condition_keys.length > 0){
//             if(Array.isArray(condition)){
//                 values = [];
//                 for (const iterator of condition) {
//                     let or_conditions = [];
//                     for (const key in iterator) {
//                         if (typeof iterator[key] === 'undefined') {
//                             let error = new Error();
//                             error.code = 422;
//                             error.name = "Error";
//                             error.message = "Condition should not contain null or empty values";
//                             throw error;
//                         }
//                         or_conditions.push(`${key}=$${i}`);
//                         values.push(iterator[key]);
//                         i++;
//                     }
//                     or_conditions = `(${or_conditions.join(" AND ")})`;
//                     conditions.push(or_conditions);
//                 }
//                 query += conditions.join(' OR ');       
//             }else{
//                 values = Object.values(condition);
//                 for (const key of condition_keys) {
//                     if (typeof condition[key] === 'undefined') {
//                         let error = new Error();
//                         error.code = 422;
//                         error.name = "Error";
//                         error.message = "Condition should not contain null or empty values";
//                         throw error;
//                     }
//                     conditions.push(`${key}=$${i}`);
//                     i++;
//                 }
//                 query += conditions.join(' AND ');
//             }
//         }
//         const response = {
//             query: query,
//             values: values
//         }
//         return response;
//     }

// }