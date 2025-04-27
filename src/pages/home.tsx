import React from 'react';
import styles from './../styles/HomePageStyle.module.css';
import Navbar from '../components/Navbar';
import Container from "../components/ui/Container";
import ButtonPrimary from "../components/ui/ButtonPrimary";
import ButtonSecondary from "../components/ui/ButtonSecondary";
import "./../styles/globals.css"

export default function home() {
  return (
    <>
    <Navbar/>
          <main>
            <Container>
              <h1>Title</h1>
              <div className={styles["subcontainer-showcase"]}></div>
              <div className={styles["buttons-showcase"]}>
                <ButtonPrimary/>
                <ButtonSecondary/>
              </div>
            </Container>
          </main>
    </>
  )
}
