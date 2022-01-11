import React from "react";
import "./styles.css";
import { Route, Switch, Redirect } from "react-router-dom";
import Converter from "./pages/Converter";

export default function App() {


  return (
    <div className="the_app">
      <Switch>
        <Redirect exact from="/" to="/markdown2json-converter" />
        <Route exact path="/markdown2json-converter" component={Converter}></Route>
      </Switch>
    </div>
  );
};