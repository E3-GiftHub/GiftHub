import React from 'react'
import './../assets/HomePageStyle.css'
import Navbar from './../components/Navbar';
import Container from "./../components/ui/Container";
import {ButtonStyle, ButtonComponent} from "./../components/ui/ButtonComponent"

export default function HomePage() {
  return (
    <>
      <Navbar/>
      <main>
        <Container>
          <h1>Title</h1>
          <div className={"subcontainer-showcase"}></div>
          <div className={"buttons-showcase"}>
            <ButtonComponent onClick={() => {
            }} style={ButtonStyle.PRIMARY} text={"Create event"}/>
            <ButtonComponent onClick={() => {
            }} style={ButtonStyle.SECONDARY} text={"Delete event"}/>
          </div>
        </Container>
      </main>
    </>
  )
}
