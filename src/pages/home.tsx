import React from 'react';
import styles from './../styles/HomePageStyle.module.css';
import Navbar from '../components/Navbar';
import {Container, ContainerBorderStyle} from "../components/ui/Container";
import {ButtonComponent, ButtonStyle} from "~/components/ui/ButtonComponent";
import CloudsBackground from "~/components/ui/CloudsBackground";
import ContainerEventTitle from "~/components/ui/ContainerEventTitle";
import "./../styles/globals.css"

export default function home() {
  return (
    <>
      <Navbar />
      <CloudsBackground/>
      <div className={styles['homepage-content']}>
        <div className={styles["homepage-containers-wrapper"]}>
          <Container borderStyle={ContainerBorderStyle.TOP}>
            <ContainerEventTitle title={"My events"}/>
            <div className={styles["buttons-wrapper"]}>
              <ButtonComponent text={"Create event"} style={ButtonStyle.PRIMARY}/>
            </div>
          </Container>

          <Container borderStyle={ContainerBorderStyle.BOTTOM}>
            <ContainerEventTitle title={"Upcoming events"}/>
          </Container>
        </div>
      </div>
    </>
  )
}
