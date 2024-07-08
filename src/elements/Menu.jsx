import React from 'react';
import { Link } from 'react-router-dom';
import './Menu.css';

const Menu = ({title, menu, className}) => {
    let closeMenu = () => {
        document.getElementById("menu-checkbox-label").click();
    }

    return (
        <div className={className} id="menu">
            <input id="menu-checkbox" type="checkbox" />
            <label id="menu-checkbox-label" htmlFor="menu-checkbox">
                <div id="menu-burger">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <h1>{title}</h1>
            </label>
            <nav onClick={closeMenu}>
                { Object.keys(menu).map((menuGroup, i) => {
                    let {items, show} = menu[menuGroup];

                    if (show) {
                        return (
                            <div className="menu-group" key={`group${i}`}>
                                <h2>{menuGroup}</h2>
                                <ul>    
                                    {items.filter(({show}) => show === undefined || show === true).map(({to, label}, j) => {
                                        return <li key={`group${i}item${j}`}><Link to={to}>{label}</Link></li>;
                                    })}
                                </ul>
                            </div>
                        )
                    }
                })}
            </nav>
        </div>
    );
}

export default Menu;