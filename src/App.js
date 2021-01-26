import './App.css';
import './common.css';

import cityJson from './city.json';

import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Chip from '@material-ui/core/Chip';
import ListItemText from '@material-ui/core/ListItemText';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';

import { StylesProvider } from '@material-ui/core/styles';

import React, { Component } from 'react';
import axios from "axios";

// Icons
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';

class App extends Component {
  
  constructor(props) {
    super(props);
    this.state = { 
      selectCities: []
    }
    this.addCity = this.addCity.bind(this);
    this.deleteCity = this.deleteCity.bind(this);
  }

  addCity(cityObject){
    console.log(cityObject);
    this.setState({
      selectCities:[...this.state.selectCities,cityObject] 
    });
  }

  deleteCity(cityObject){ 
    console.log(cityObject)   
    this.setState({
      selectCities:this.state.selectCities.filter((item) => item.id !== cityObject.id)
    });
  }

  render() { 
    return (
      <StylesProvider injectFirst>
        <Container>
          <Grid container md={5}>
      
            <Search selectCities={this.state.selectCities}
             addCity={this.addCity} deleteCity={this.deleteCity} />
      
            <Grid item container md={12} className="grid-view-container">
                <CityView selectCities={this.state.selectCities}/>
                <ActivityView />
            </Grid>
          
          </Grid>
        </Container>
      </StylesProvider>
    );
  }
}
 
function CityView(props){
  const cityViewList = props.selectCities.map(item => {
    return (
      <ListItem key={item.id} button>
        <ListItemText primary={item.name} />
      </ListItem>
    )
  })

  return(
    <Grid item xs={6} className="grid-city-view">
      <List>
        {cityViewList}
      </List>
    </Grid>
  )
}

class ActivityView extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      activities:[],
      loading:false,
      prevY:0
    }
    // Size of items to attach to attach to list
    this.batchSize = 10
    // size of items given by api
    this.pageSize = 30

    this.activityList = React.createRef();
    this.loadingRef = React.createRef();

    this.getMoreActivity = this.getMoreActivity.bind(this);
    this.handleObserver = this.handleObserver.bind(this);

  }

  componentDidMount(){
    this.getMoreActivity();
    var options = {
      root: document.querySelector('#scrollArea'),
      rootMargin: "0px",
      threshold: 1.0
    }
  
    this.observer = new IntersectionObserver(
      this.handleObserver.bind(this),
      options
    )

    this.observer.observe(this.loadingRef.current);

  }

  handleObserver(entities,observer){
    const y = entities[0].boundingClientRect.y;
    console.log("loading ...")

    if(this.state.prevY>y){
      console.log("loading ...")
      this.getMoreActivity()
    }
    this.setState({
      prevY:y
    })
  }

  getMoreActivity(){

    if(this.state.loading){
      return
    }

    this.setState({
      loading:true
    })

    const loadedItems = this.state.activities.length;
    const apiIndex = parseInt( loadedItems/this.pageSize )+1;
    const pageStart = parseInt( loadedItems%this.pageSize );
    const pageEnd = pageStart+this.batchSize;

    console.log(apiIndex);

    axios.get(
      `http://my-json-server.typicode.com/rivitest001/task0${apiIndex}/posts`
    ).then(res => {
      console.log(res.data)
      this.setState({
        activities:[...this.state.activities,...res.data.slice(pageStart,pageEnd)]
      })
    })

  }

  render() { 

    const activityList = this.state.activities.map( activity => {
      return (
        <ListItem key={activity.id} button>
          <ListItemText primary={activity.activity} />
        </ListItem> 
      )
    });

    return(
      <Grid item xs={6} className="grid-activity-view">
        <List id="scrollArea" ref={this.activityList}>
          {activityList}          
          <ListItem ref={this.loadingRef}
          button>
            <ListItemText primary="Loading.." />
          </ListItem> 
        </List>
      </Grid>
    )
  }
}

class Search extends Component {
 
  constructor(props) {
    super(props);
    this.state = { 
      query:"",
      cities:[]
    }
    this.handleSearchInput = this.handleSearchInput.bind(this);
    this.suggestCities = this.suggestCities.bind(this);
    this.selectSuggestCity = this.selectSuggestCity.bind(this);
    this.deleteSearchChip = this.deleteSearchChip.bind(this);
  }

  handleSearchInput(e){
    this.setState({
      query: e.target.value
    });
    if(e.target.value.length>0){
      this.suggestCities(e.target.value)      
    }
  }

  suggestCities(query){
    let cityArray = cityJson.cities.filter( (item) => {
      return item.name.includes(query)
    });

    this.setState({
      cities: cityArray
    })
  }

  selectSuggestCity(e){
    
    const listItem = e.currentTarget;
    this.setState({
      query:"",
      cities:[]
    });
    this.props.addCity({
      id:listItem.getAttribute("data-id"),
      name:listItem.getAttribute("data-name"),
    })
  }

  deleteSearchChip(e){
    const chipItem = e.target.parentNode;
    this.props.deleteCity({
      id: chipItem.getAttribute("data-id"),
      name: chipItem.getAttribute("data-name")
    });
  }

  render() { 
    return ( 
      <Grid style={{position:"relative"}} item md={12}> 
        <SearchBar selectCities={this.props.selectCities}
        deleteCity={this.deleteSearchChip}
        query={this.state.query} handleSearchInput={this.handleSearchInput} />
        {this.state.query.length>0 &&
          <SearchSuggestBar selectSuggestCity={this.selectSuggestCity}
          cities={this.state.cities} /> }
      </Grid>

    );
  }
}
 
const SearchBar = (props) => {
  return (  
    <Paper component="form" className="">
      <Grid container className="search-bar-container" direction="row">
            
            <Grid item md={11} className="search-bar-input-outer display-center">
                <SearchChipView deleteCity={props.deleteCity}
                selectCities={props.selectCities} />
                <InputBase 
                  value={props.query}
                  onChange={props.handleSearchInput}
                  className="search-bar-input"
                  placeholder="Search location"
                />
            </Grid>
            <Grid item md={1}>
              <IconButton type="submit">
                <SearchIcon />
              </IconButton>
            </Grid>

      </Grid>
    </Paper>
  );
}

function SearchChipView(props){
  const chipViewList = props.selectCities.map(item => {
    return(
      <Chip 
        data-id={item.id}
        data-name={item.name}
        key={item.id}
        className="search-key-chip"
        label={item.name}
        deleteIcon={<ClearIcon />}
        onDelete={props.deleteCity}
      />
    )
  })

  return(
    <Box component="span" className="display-flex" >
      {chipViewList}
    </Box>               
  )
}

function SearchSuggestBar(props){

  if(props.cities.length === 0){
    return(
      <Grid container className="suggest-list">
          <Grid item md={12} sm={12} xs={12}>
            <List component="nav" className="suggest-list-nav">
              <ListItem className="suggest-list-item">
                <ListItemText primary="No Result Found" />
              </ListItem>
            </List>
          </Grid>
      </Grid>
    )
  }
  else{
    const suggestList = props.cities.map(item => {
      return(
        <ListItem onClick={props.selectSuggestCity}
        data-name={item.name} data-id={item.id} 
        key={item.id} className="suggest-list-item">
          <ListItemText primary={item.name} />
        </ListItem>
      )
    });
    return ( 
      <Grid container className="suggest-list">
          <Grid item md={12} sm={12} xs={12}>
            <List component="nav" md={12} item={3} className="suggest-list-nav">
              {suggestList}
            </List>
          </Grid>
      </Grid>
    );
  }

}

export default App;
