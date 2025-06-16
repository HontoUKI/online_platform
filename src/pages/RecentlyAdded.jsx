import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import moduleData from '../data/modules.json';
import Header from '../sections/Header';
import Menu from '../components/Menu';

function RecentlyAdded() {

    return(
        <div className="app full-center">
            <Header />
            <div className="page-container">
            </div>
        </div>
    );
};
export default RecentlyAdded()