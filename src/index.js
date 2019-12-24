
let functions = {};
functions.getSelectQuery = (configs) =>{
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
                        or_conditions.push(`${key}=${functions.removeSpecial(iterator[key])}`);
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
                    conditions_array.push(`${key}=${functions.removeSpecial(join['condition'][key])}`);
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
functions.getInsertQuery = (configs)=>{
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

            let values = [];
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
                        values.push(iterator[key]);
                        insertions.push(`$${i}`);
                        i++;
                    }
                }
                parameters.push(`(${insertions.join()})`);
            }
            console.log(values);
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
functions.getUpdateQuery = (configs) =>{
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
functions.getDeleteQuery = (configs) =>{
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
functions.removeSpecial = (string) =>{
    let regex = /^'(.).*\1'$/;
    if(!regex.test(string)){
        return string;
    }
    string = string.slice(1,-1);
    string = string.replace(/&/g, '&amp;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
    .replace(/\\/g, '\\\\')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\u0000/g, '\\0');
    return `'${string}'`;
}
module.exports = functions;