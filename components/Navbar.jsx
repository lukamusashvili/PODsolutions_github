import { useLocation } from 'react-router-dom';
import createApp from '@shopify/app-bridge';
import {Redirect} from '@shopify/app-bridge/actions';
import Link from 'next/link'

export default function Navbar() {
  let location = useLocation();
  const config = {
    apiKey: '341e15139cc5c6d65eb5b8027b80908b',
    host: new URLSearchParams(location.search).get("host"),
    forceRedirect: true
  };
  
  const app = createApp(config);
  const redirect = Redirect.create(app);

 

  return (
  
    <nav style={style.nav}>
      <div className={location.pathname === "/" && "navItem"} style={style.li} onClick={() => redirect.dispatch(Redirect.Action.APP,  `/`)} >Main</div>
      <div className={location.pathname.includes("support")  && "navItem"} style={style.li} onClick={() => redirect.dispatch(Redirect.Action.APP, '/support')}>Support</div>
    </nav>

    
  )

  
}



const style = {
  nav: {
    display: "flex",
    borderBottom: "1px solid #e1e3e5",
  },
  li: {
    transition: "1s",
    position: "relative",
    cursor: "default",
    padding: "16px 20px",
  }
}