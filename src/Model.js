export default class Model {

    constructor(tablename, axios, baseURL) {
      this.$config = {};
      this.$config.tablename = tablename;
      this.$config.axios = axios;
      this.$config.baseURL = baseURL;
      this.clearConfig();
    }
    clearConfig(){
      this.$config.fields = {};
      this.$config.filters = {};
      this.$config.filter_oper = {};
      this.$config.sorts = [];
      this.$config.page = 1;
      this.$config.limit = 100;
      this.$config.payload = null;
    }


    primaryKey() {
      return 'id'
    }
    getPrimaryKey() {
      return this[this.primaryKey()]
    }

    hasId() {
      const id = this.getPrimaryKey();
      return this.isValidId(id)
    }
    
    isValidId(id) {
      return !!id
    }

    select(...fields) {
      if (fields.length === 0) { throw new Error('You must specify the fields on select() method.'); }
      
      if (typeof fields[0] === 'string' || Array.isArray(fields[0])) {
         this.$config.fields[this.$config.tablename] = fields.join(',');
      }
      
      return this
    }

    where(field, oper, value) {
      let operation = null;
      if (value===undefined) {
        value = oper;
      } else {
        operation = oper;
      }

      this.$config.filters[field] = value;
      if (operation) this.$config.filter_oper[field] = operation;
      
      return this
    }

    whereIn(field, array) {
      if (!Array.isArray(array)) {
        throw new Error('The second argument on whereIn() method must be an array.')
      }

      this.$config.filters[field] = array.join(',');

      return this
    }

    orderBy(...fields) {
      return this.sortBy(fields);
    }

    sortBy(...fields) {
      this.$config.sorts = Array.isArray(fields[0]) ? fields[0] : fields;

      return this
    }
    
    page(value) {
      this.$config.page = value;

      return this
    }

    limit(value) {
      this.$config.limit = value;

      return this
    }
    
    params(payload) {
      if (payload === undefined || typeof payload !== 'object') {
        throw new Error('You must pass a payload/object as param.')
      }

      this.$config.payload = payload;

      return this
    }


    /**
     * Result
     */
    _setInstance(data) {
        this.clearConfig();
        let collection = data.data || data;
        let instance = new this.constructor(this.$config.tablename, this.$config.axios, this.$config.baseURL);
        Object.assign(instance, data);
        return instance;
    }

    _getInstance(){
      let collection = {};
      Object.assign(collection, this);
      delete collection["$config"];
      return collection;
    }


    new() {
      return this._setInstance({});
    }

    /**
     * Methods
     */

    endpoint() {
      if (this.hasId()) {
        return `${this.$config.baseURL}/${this.$config.tablename}/${this.getPrimaryKey()}`;
      } else {
        return `${this.$config.baseURL}/${this.$config.tablename}`
      }
    }

    first() {
      this.params({first:true});
      return this.get(true);
    }
    

    find(identifier) {
      if (identifier === undefined) {
        throw new Error('You must specify the param on find() method.')
      }
      let base = `${this.$config.baseURL}/${this.$config.tablename}`;
      let url = `${base}/${identifier}${this._query()}`;
      
      return this.$config.axios({
          url:url,
          method: 'GET'
        }).then(response => {
           return this._setInstance(response.data)
        })
    }


    get(asInstance, row) {
      let base = `${this.$config.baseURL}/${this.$config.tablename}`;
      let url = `${base}${this._query()}`;
      
      return this.$config.axios({
          url:url,
          method: 'GET'
        }).then(response => {
           if (asInstance) this._setInstance(response.data);
           if (row) response.data[row];
           return response.data;
       });
    }

    all() {
      return this.get();
    }


    modelInfo() {
      let base = `${this.$config.baseURL}/${this.$config.tablename}`;
      let url = `${base}/modelInfo()`;
      
      return this.$config.axios({
          url:url,
          method: 'GET'
        }).then(response => {
           return response.data
        })
    }



    /**
     * Common CRUD operations
     */

    delete() {
      if (!this.hasId()) {
        throw new Error('This model has a empty ID.')
      }

      return this.$config.axios({
          method: 'DELETE',
          url: this.endpoint()
        }).then(response => response)
    }

    save() {
      return this.hasId() ? this._update() : this._create()
    }

    _create() {
      return this.$config.axios({
          method: 'POST',
          url: this.endpoint(),
          data: this._getInstance()
       }).then(response => {
          return this._setInstance(response.data)
       })
    }

    _update() {
      return this.$config.axios({
          method: 'PUT',
          url: this.endpoint(),
          data: this._getInstance()
        }).then(response => {
           return this._setInstance(response.data)
        })
    }







    _query() {
      var uri = '?';

      if (Object.keys(this.$config.fields).length > 0) {
         uri += 'fields['+this.$config.tablename+']='+this.$config.fields[this.$config.tablename] + '&';
      }

      if (Object.keys(this.$config.filters).length > 0) {
         for (let k in this.$config.filters) {
           uri += 'filter['+k+']='+this.$config.filters[k] + '&';
         }
         for (let k in this.$config.filter_oper) {
           uri += 'filter_oper['+k+']='+this.$config.filter_oper[k] + '&';
         }
      }

      if (this.$config.sorts.length > 0) {
         uri += 'sort='+this.$config.sorts.join(',') + '&';
      }

      for (let k in this.$config.payload) {
        uri += k+'='+this.$config.payload[k] + '&';
      }

      uri += 'page='+this.$config.page+'&';
      uri += 'limit='+this.$config.limit+'&';
      
      return uri;
    }


}//export default class Model
