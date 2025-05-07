"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react"; // Adjust import path as needed
import { Status } from "@prisma/client";

// Reusable card component for each test section
const TestCard: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <h3 className="mb-4 text-lg font-semibold text-gray-800">{title}</h3>
    {children}
  </div>
);

// Input field component
const InputField: React.FC<{
  label: string;
  name: string;
  type?: string;
  value: string | number | Date;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}> = ({ label, name, type = "text", value, onChange, required = false }) => (
  <div className="mb-3">
    <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={type === "date" || type === "datetime-local" ? value.toString() : value}
      onChange={onChange}
      required={required}
      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </div>
);

// Button component
const Button: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ onClick, children, className = "", disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 ${className}`}
  >
    {children}
  </button>
);

// Response display component
const ResponseDisplay: React.FC<{
  loading: boolean;
  error: Error | null;
  data: any;
}> = ({ loading, error, data }) => (
  <div className="mt-4">
    <h4 className="mb-2 text-sm font-medium text-gray-700">Response:</h4>
    <div className="max-h-60 overflow-auto rounded-md bg-gray-50 p-3">
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error.message}</p>
      ) : data ? (
        <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p className="text-sm text-gray-500">No response yet</p>
      )}
    </div>
  </div>
);

export default function EventTRPCTestClient() {
  // State for the create event form
  const [createEventForm, setCreateEventForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toISOString().split(".")[0],
    location: "",
  });

  // State for other operations
  const [eventId, setEventId] = useState<number | null>(null);
  const [guestId, setGuestId] = useState<number | null>(null);
  const [invitationId, setInvitationId] = useState<number | null>(null);
  const [invitationStatus, setInvitationStatus] = useState<Status>(Status.PENDING);

  // Setup API hooks
  const createEvent = api.event.createEvent.useMutation();
  const getEvent = api.event.getEvent.useQuery(
    { eventId: eventId ? eventId : 0 }, 
    { enabled: false }
  );
  const publishEvent = api.event.publishEvent.useMutation();
  const removeEvent = api.event.removeEvent.useMutation();
  const sendInvitation = api.event.sendInvitation.useMutation();
  const getEventAnalytics = api.event.getEventAnalytics.useQuery(
    { eventId: eventId ? eventId : 0 }, 
    { enabled: false }
  );
  const getEventWishlist = api.event.getEventWishlist.useQuery(
    { eventId: eventId ? eventId : 0 }, 
    { enabled: false }
  );
  const getEventGallery = api.event.getEventGallery.useQuery(
    { eventId: eventId ? eventId : 0 }, 
    { enabled: false }
  );
  const getEventContributions = api.event.getEventContributions.useQuery(
    { eventId: eventId ? eventId : 0 }, 
    { enabled: false }
  );
  const userEvents = api.event.getUserEvents.useQuery();
  const invitedEvents = api.event.getInvitedEvents.useQuery();
  const respondToInvitation = api.event.respondToInvitation.useMutation();

  // Event handlers
  const handleCreateEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateEventForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateEventSubmit = async () => {
    try {
      await createEvent.mutateAsync({
        ...createEventForm,
        date: new Date(createEventForm.date),
        time: new Date(createEventForm.time),
      });
    } catch (err) {
      console.error("Failed to create event:", err);
    }
  };

  const handleGetEvent = () => {
    if (eventId) {
      getEvent.refetch();
    }
  };

  const handlePublishEvent = async () => {
    if (eventId) {
      try {
        await publishEvent.mutateAsync({ eventId: eventId });
      } catch (err) {
        console.error("Failed to publish event:", err);
      }
    }
  };

  const handleRemoveEvent = async () => {
    if (eventId) {
      try {
        await removeEvent.mutateAsync({ eventId: eventId });
      } catch (err) {
        console.error("Failed to remove event:", err);
      }
    }
  };

  const handleSendInvitation = async () => {
    if (eventId && guestId) {
      try {
        await sendInvitation.mutateAsync({ eventId: eventId, guestId });
      } catch (err) {
        console.error("Failed to send invitation:", err);
      }
    }
  };

  const handleGetEventAnalytics = () => {
    if (eventId) {
      getEventAnalytics.refetch();
    }
  };

  const handleGetEventWishlist = () => {
    if (eventId) {
      getEventWishlist.refetch();
    }
  };

  const handleGetEventGallery = () => {
    if (eventId) {
      getEventGallery.refetch();
    }
  };

  const handleGetEventContributions = () => {
    if (eventId) {
      getEventContributions.refetch();
    }
  };

  const handleRespondToInvitation = async () => {
    if (invitationId) {
      try {
        await respondToInvitation.mutateAsync({
          invitationId: invitationId,
          status: invitationStatus,
        });
      } catch (err) {
        console.error("Failed to respond to invitation:", err);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">tRPC Event Router Test Page</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Create Event */}
        <TestCard title="Create Event">
          <InputField
            label="Title"
            name="title"
            value={createEventForm.title}
            onChange={handleCreateEventChange}
            required
          />
          <InputField
            label="Description"
            name="description"
            value={createEventForm.description}
            onChange={handleCreateEventChange}
          />
          <InputField
            label="Date"
            name="date"
            type="date"
            value={createEventForm.date}
            onChange={handleCreateEventChange}
            required
          />
          <InputField
            label="Time"
            name="time"
            type="datetime-local"
            value={createEventForm.time}
            onChange={handleCreateEventChange}
            required
          />
          <InputField
            label="Location"
            name="location"
            value={createEventForm.location}
            onChange={handleCreateEventChange}
            required
          />
          <Button
            onClick={handleCreateEventSubmit}
            disabled={createEvent.isLoading}
          >
            Create Event
          </Button>
          <ResponseDisplay
            loading={createEvent.isLoading}
            error={createEvent.error as Error | null}
            data={createEvent.data}
          />
        </TestCard>

        {/* Event ID Operations */}
        <TestCard title="Event Operations">
          <InputField
            label="Event ID"
            name="eventId"
            value={eventId}
            onChange={(e) => setEventId(Number(e.target.value) || null)}
            required
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleGetEvent} disabled={!eventId}>Get Event</Button>
            <Button onClick={handlePublishEvent} disabled={!eventId || publishEvent.isLoading}>Publish</Button>
            <Button onClick={handleRemoveEvent} disabled={!eventId || removeEvent.isLoading} className="bg-red-600 hover:bg-red-700">Remove</Button>
            <Button onClick={handleGetEventAnalytics} disabled={!eventId}>Analytics</Button>
            <Button onClick={handleGetEventWishlist} disabled={!eventId}>Wishlist</Button>
            <Button onClick={handleGetEventGallery} disabled={!eventId}>Gallery</Button>
            <Button onClick={handleGetEventContributions} disabled={!eventId}>Contributions</Button>
          </div>
          <ResponseDisplay
            loading={getEvent.isLoading || publishEvent.isLoading || removeEvent.isLoading || 
                    getEventAnalytics.isLoading || getEventWishlist.isLoading || 
                    getEventGallery.isLoading || getEventContributions.isLoading}
            error={(getEvent.error || publishEvent.error || removeEvent.error || 
                   getEventAnalytics.error || getEventWishlist.error || 
                   getEventGallery.error || getEventContributions.error) as Error | null}
            data={getEvent.data || publishEvent.data || removeEvent.data || 
                  getEventAnalytics.data || getEventWishlist.data || 
                  getEventGallery.data || getEventContributions.data}
          />
        </TestCard>

        {/* Send Invitation */}
        <TestCard title="Send Invitation">
          <InputField
            label="Event ID"
            name="inviteEventId"
            value={eventId}
            onChange={(e) => setEventId(Number(e.target.value) || null)}
            required
          />
          <InputField
            label="Guest ID"
            name="guestId"
            value={guestId}
            onChange={(e) => setGuestId(e.target.value)}
            required
          />
          <Button
            onClick={handleSendInvitation}
            disabled={!eventId || !guestId || sendInvitation.isLoading}
          >
            Send Invitation
          </Button>
          <ResponseDisplay
            loading={sendInvitation.isLoading}
            error={sendInvitation.error as Error | null}
            data={sendInvitation.data}
          />
        </TestCard>

        {/* Respond to Invitation */}
        <TestCard title="Respond to Invitation">
          <InputField
            label="Invitation ID"
            name="invitationId"
            value={invitationId}
            onChange={(e) => setInvitationId(Number(e.target.value) || null)}
            required
          />
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={invitationStatus}
              onChange={(e) => setInvitationStatus(e.target.value as Status)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={Status.ACCEPTED}>ACCEPTED</option>
              <option value={Status.DECLINED}>DECLINED</option>
              <option value={Status.PENDING}>PENDING</option>
              <option value={Status.MAYBE}>MAYBE</option>
            </select>
          </div>
          <Button
            onClick={handleRespondToInvitation}
            disabled={!invitationId || respondToInvitation.isLoading}
          >
            Respond
          </Button>
          <ResponseDisplay
            loading={respondToInvitation.isLoading}
            error={respondToInvitation.error as Error | null}
            data={respondToInvitation.data}
          />
        </TestCard>

        {/* My Events */}
        <TestCard title="My Events">
          <Button onClick={() => userEvents.refetch()}>Refresh My Events</Button>
          <ResponseDisplay
            loading={userEvents.isLoading}
            error={userEvents.error as Error | null}
            data={userEvents.data}
          />
        </TestCard>

        {/* My Invitations */}
        <TestCard title="My Invitations">
          <Button onClick={() => invitedEvents.refetch()}>Refresh My Invitations</Button>
          <ResponseDisplay
            loading={invitedEvents.isLoading}
            error={invitedEvents.error as Error | null}
            data={invitedEvents.data}
          />
        </TestCard>
      </div>
    </div>
  );
}
