import React from "react";
import "./styles.css";
import { Route, Switch, Redirect } from "react-router-dom";
import Converter from "./pages/Converter";

export default function App() {


  return (
    <div className="the_app">
      <Switch>
        <Redirect exact from="/" to="/makrdown2json-converter" />
        <Route exact path="/makrdown2json-converter" component={Converter}></Route>
      </Switch>
    </div>
  );
};