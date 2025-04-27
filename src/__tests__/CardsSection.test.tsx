import React from 'react';
import { render, screen } from "@testing-library/react";
import CardsSection from "../components/CardsSection";

 test('renders CardsSection component without crashing', () => {
   render(<CardsSection />);
   const cardsContainer = screen.getByLabelText('cardsSection');
   expect(cardsContainer).toBeInTheDocument();
 });
 
 test('renders all event cards from cardInfo object', () => {
   render(<CardsSection />);
   const cardElements = screen.getAllByLabelText('eventCard');
   expect(cardElements.length).toBe(8);
 });
 
 test('card information matches what is in cardInfo (for the first card)', () => {
   render(<CardsSection />);
   const firstCard = screen.getByText(/Birthday Party/i);
   expect(firstCard).toBeInTheDocument();
 });