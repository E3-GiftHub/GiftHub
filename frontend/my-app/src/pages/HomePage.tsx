import React from 'react'
import './../assets/HomePageStyle.css'
import Navbar from './../components/Navbar';
import Container from "./../components/ui/Container";
import ButtonPrimary from "./../components/ui/ButtonPrimary";
import ButtonSecondary from "./../components/ui/ButtonSecondary";

export default function HomePage() {
  return (
    <>
    <Navbar/>
          <main>
            <Container>
              <h1>Title</h1>
              <div className={"subcontainer-showcase"}></div>
              <div className={"buttons-showcase"}>
                <ButtonPrimary/>
                <ButtonSecondary/>
              </div>
            </Container>
          </main>
    </>
  )
}
