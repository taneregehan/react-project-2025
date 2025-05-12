import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import type { ScheduleInstance } from "../../models/schedule";
import type { UserInstance } from "../../models/user";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { EventInput, EventDropArg } from "@fullcalendar/core/index.js";
import "../profileCalendar.scss";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { updateEventDate } from "../../store/schedule/actions";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

type CalendarContainerProps = {
  schedule: ScheduleInstance;
  auth: UserInstance;
};

type EventPopupData = {
  visible: boolean;
  staffName: string;
  shiftName: string;
  date: string;
  startTime: string;
  endTime: string;
  position: { x: number; y: number };
};

type PairDate = {
  date: string;
  pairIndex: number;
  staffId: string;
};

const classes = [
  "bg-one",
  "bg-two",
  "bg-three",
  "bg-four",
  "bg-five",
  "bg-six",
  "bg-seven",
  "bg-eight",
  "bg-nine",
  "bg-ten",
  "bg-eleven",
  "bg-twelve",
  "bg-thirteen",
  "bg-fourteen",
  "bg-fifteen",
  "bg-sixteen",
  "bg-seventeen",
  "bg-eighteen",
  "bg-nineteen",
  "bg-twenty",
  "bg-twenty-one",
  "bg-twenty-two",
  "bg-twenty-three",
  "bg-twenty-four",
  "bg-twenty-five",
  "bg-twenty-six",
  "bg-twenty-seven",
  "bg-twenty-eight",
  "bg-twenty-nine",
  "bg-thirty",
  "bg-thirty-one",
  "bg-thirty-two",
  "bg-thirty-three",
  "bg-thirty-four",
  "bg-thirty-five",
  "bg-thirty-six",
  "bg-thirty-seven",
  "bg-thirty-eight",
  "bg-thirty-nine",
  "bg-forty",
];

const CalendarContainer = ({ schedule, auth }: CalendarContainerProps) => {
  const calendarRef = useRef<FullCalendar>(null);
  const dispatch = useDispatch();

  const [events, setEvents] = useState<EventInput[]>([]);
  const [allEvents, setAllEvents] = useState<EventInput[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
  const [pairDates, setPairDates] = useState<PairDate[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [initialDate, setInitialDate] = useState<Date | null>(null);
  const [calendarInitialized, setCalendarInitialized] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [eventPopup, setEventPopup] = useState<EventPopupData>({
    visible: false,
    staffName: "",
    shiftName: "",
    date: "",
    startTime: "",
    endTime: "",
    position: { x: 0, y: 0 },
  });

  useEffect(() => {
    if (schedule?.assignments?.length > 0 && !calendarInitialized) {
      const sortedAssignments = [...schedule.assignments].sort((a, b) => {
        return new Date(a.shiftStart).getTime() - new Date(b.shiftStart).getTime();
      });

      if (sortedAssignments.length > 0) {
        const firstEventDate = dayjs.utc(sortedAssignments[0].shiftStart).toDate();
        setInitialDate(firstEventDate);
        setCalendarInitialized(true);
      }
    }
  }, [schedule?.assignments, calendarInitialized]);

  useEffect(() => {
    if (calendarRef.current && initialDate && calendarInitialized) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(initialDate);
    }
  }, [initialDate, calendarInitialized]);

  const getPlugins = () => {
    const plugins = [dayGridPlugin];
    plugins.push(interactionPlugin);
    return plugins;
  };

  const getShiftById = (id: string) => {
    return schedule?.shifts?.find((shift: { id: string }) => id === shift.id);
  };

  const getAssigmentById = (id: string) => {
    return schedule?.assignments?.find((assign) => id === assign.id);
  };

  const getStaffById = (id: string) => {
    return schedule?.staffs?.find((staff) => id === staff.id);
  };

  const validDates = () => {
    const dates = [];
    if (!schedule?.scheduleStartDate || !schedule?.scheduleEndDate) return [];

    let currentDate = dayjs(schedule.scheduleStartDate);
    while (
      currentDate.isBefore(schedule.scheduleEndDate) ||
      currentDate.isSame(schedule.scheduleEndDate)
    ) {
      dates.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }

    return dates;
  };

  const getDatesBetween = (startDate: string, endDate: string) => {
    const dates = [];
    const start = dayjs(startDate, "DD.MM.YYYY").toDate();
    const end = dayjs(endDate, "DD.MM.YYYY").toDate();
    const current = new Date(start);

    while (current <= end) {
      dates.push(dayjs(current).format("DD-MM-YYYY"));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const generateAllEvents = () => {
    const works: EventInput[] = [];

    for (let i = 0; i < (schedule?.assignments?.length || 0); i++) {
      const className = schedule?.shifts?.findIndex(
        (shift) => shift.id === schedule?.assignments?.[i]?.shiftId
      );

      const assignmentDate = dayjs.utc(schedule?.assignments?.[i]?.shiftStart).format("YYYY-MM-DD");
      const isValidDate = validDates().includes(assignmentDate);

      const staffId = schedule?.assignments?.[i]?.staffId;
      const shiftId = schedule?.assignments?.[i]?.shiftId;

      const work = {
        id: schedule?.assignments?.[i]?.id,
        title: getShiftById(shiftId)?.name,
        duration: "01:00",
        date: assignmentDate,
        staffId: staffId,
        shiftId: shiftId,
        start: schedule?.assignments?.[i]?.shiftStart,
        end: schedule?.assignments?.[i]?.shiftEnd,
        shiftStart: schedule?.assignments?.[i]?.shiftStart,
        shiftEnd: schedule?.assignments?.[i]?.shiftEnd,
        className: `event ${classes[className] || "bg-one"} ${
          getAssigmentById(schedule?.assignments?.[i]?.id)?.isUpdated ? "highlight" : ""
        } ${!isValidDate ? "invalid-date" : ""}`,
      };
      works.push(work);
    }

    setAllEvents(works);
    return works;
  };

  const generateStaffBasedCalendar = () => {
    if (!schedule || !schedule.scheduleStartDate || !schedule.scheduleEndDate) return;

    const allEventsData = allEvents.length > 0 ? allEvents : generateAllEvents();

    const staffEvents = allEventsData.filter((event) =>
      selectedStaffId ? event.staffId === selectedStaffId : false
    );

    const offDays = schedule?.staffs?.find((staff) => staff.id === selectedStaffId)?.offDays || [];

    const dates = getDatesBetween(
      dayjs(schedule.scheduleStartDate).format("DD.MM.YYYY"),
      dayjs(schedule.scheduleEndDate).format("DD.MM.YYYY")
    );

    let highlightedDates: string[] = [];

    dates.forEach((date) => {
      const transformedDate = dayjs(date, "DD-MM-YYYY").format("DD.MM.YYYY");
      if (offDays.includes(transformedDate)) highlightedDates.push(date);
    });

    const selectedStaff = schedule?.staffs?.find((staff) => staff.id === selectedStaffId);
    const pairList = selectedStaff?.pairList || [];

    const pairDatesArray: PairDate[] = [];

    pairList.forEach((pair, pairIndex) => {
      const pairDates = getDatesBetween(pair.startDate, pair.endDate);

      pairDates.forEach((date) => {
        pairDatesArray.push({
          date,
          pairIndex: pairIndex % 20,
          staffId: pair.staffId,
        });
      });
    });

    setPairDates(pairDatesArray);
    setHighlightedDates(highlightedDates);
    setEvents(staffEvents);
  };

  const addExampleEvent = () => {
    const specificEvent = {
      id: "7f7a71ca-d828-4f88-9a7f-051acf93697b",
      title: "Morning",
      duration: "01:00",
      date: "2025-10-06",
      start: "2025-10-06T08:30:00.000Z",
      end: "2025-10-06T12:00:00.000Z",
      staffId: selectedStaffId || "6a003ce0-f3e4-43e4-9f3d-f8850297ffa8",
      shiftId: "1d8bd052-3750-4d5d-bdaa-70055737a2f0",
      shiftStart: "2025-10-06T08:30:00.000Z",
      shiftEnd: "2025-10-06T12:00:00.000Z",
      className: "event bg-one ",
    };

    setAllEvents((prev) => [...prev.filter((e) => e.id !== specificEvent.id), specificEvent]);
    setEvents((prev) => [...prev.filter((e) => e.id !== specificEvent.id), specificEvent]);

    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate("2025-10-06");
    }
  };

  useEffect(() => {
    setSelectedStaffId(schedule?.staffs?.[0]?.id);
    generateAllEvents();
  }, [schedule]);

  useEffect(() => {
    generateStaffBasedCalendar();
  }, [selectedStaffId, allEvents, schedule]);

  const handleEventClick = (eventInfo: any) => {
    setEventPopup((prev) => ({ ...prev, visible: false }));

    setTimeout(() => {
      const eventData = eventInfo.event;
      const staffId = eventData.extendedProps.staffId;
      const shiftId = eventData.extendedProps.shiftId;

      const staff = getStaffById(staffId);
      const shift = getShiftById(shiftId);

      const date = dayjs(eventData.start).format("DD.MM.YYYY");
      const startTime = dayjs(eventData.extendedProps.shiftStart).format("HH:mm");
      const endTime = dayjs(eventData.extendedProps.shiftEnd).format("HH:mm");

      const rect = eventInfo.el.getBoundingClientRect();

      setEventPopup({
        visible: true,
        staffName: staff?.name || "",
        shiftName: shift?.name || "",
        date,
        startTime,
        endTime,
        position: {
          x: rect.left + window.scrollX,
          y: rect.bottom + window.scrollY + 5,
        },
      });
    }, 50);
  };

  const handleEventDrop = (info: EventDropArg) => {
    const eventId = info.event.id;
    const newStart = info.event.start?.toISOString() || "";
    const newEnd = info.event.end?.toISOString() || "";

    dispatch(
      updateEventDate({
        eventId,
        newStart,
        newEnd,
        onSuccess: () => {
          console.log("Event updated successfully");
        },
        onError: (error) => {
          info.revert();
          console.error("Failed to update event", error);
        },
      })
    );
  };

  const handleDocumentClick = (e: MouseEvent) => {
    const popupElement = document.querySelector(".event-popup");
    const fcEvent = (e.target as HTMLElement)?.closest(".fc-event");

    if (fcEvent) return;

    if (popupElement && !popupElement.contains(e.target as Node)) {
      setEventPopup((prev) => ({ ...prev, visible: false }));
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  const RenderEventContent = ({ eventInfo }: any) => {
    return (
      <div className="event-content">
        <p>{eventInfo.event.title}</p>
      </div>
    );
  };

  const EventDetailsPopup = () => {
    if (!eventPopup.visible) return null;

    return (
      <div
        className="event-popup"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          left: `${eventPopup.position.x}px`,
          top: `${eventPopup.position.y}px`,
          zIndex: 1000,
          backgroundColor: "white",
          border: "none",
          borderRadius: "8px",
          padding: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          minWidth: "250px",
          animation: "fadeIn 0.2s ease-in-out",
        }}>
        <div className="event-popup-content">
          <h4 style={{ marginTop: 0, color: "#19979c", marginBottom: "12px", fontSize: "18px" }}>
            {eventPopup.shiftName}
          </h4>
          <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16px"
              viewBox="0 -960 960 960"
              width="16px"
              fill="#666">
              <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z" />
              <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17-62.5t47-43.5q60-30 124.5-46T480-440q67 0 131.5 16T736-378q30 15 47 43.5t17 62.5v112H160Z" />
            </svg>
            <strong style={{ color: "#555" }}>Personel:</strong>
            <span style={{ color: "#333" }}>{eventPopup.staffName}</span>
          </div>
          <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16px"
              viewBox="0 0 24 24"
              width="16px"
              fill="#666">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M19 4h-1V3c0-.55-.45-1-1-1s-1 .45-1 1v1H8V3c0-.55-.45-1-1-1s-1 .45-1 1v1H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z" />
            </svg>
            <strong style={{ color: "#555" }}>Tarih:</strong>
            <span style={{ color: "#333" }}>{eventPopup.date}</span>
          </div>
          <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16px"
              viewBox="0 0 24 24"
              width="16px"
              fill="#666">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
            <strong style={{ color: "#555" }}>Başlangıç Saati:</strong>
            <span style={{ color: "#333" }}>{eventPopup.startTime}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16px"
              viewBox="0 0 24 24"
              width="16px"
              fill="#666">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
            <strong style={{ color: "#555" }}>Bitiş Saati:</strong>
            <span style={{ color: "#333" }}>{eventPopup.endTime}</span>
          </div>
          <button
            onClick={() => setEventPopup((prev) => ({ ...prev, visible: false }))}
            style={{
              marginTop: "12px",
              padding: "6px 12px",
              backgroundColor: "#19979c",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              float: "right",
            }}>
            Kapat
          </button>
        </div>
      </div>
    );
  };

  const filteredStaff =
    schedule?.staffs?.filter((staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="calendar-section">
      <div className="calendar-wrapper">
        <div className="staff-search-container">
          <input
            type="text"
            className="staff-search-input"
            placeholder="Personel ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="staff-list">
          {filteredStaff.map((staff: any) => (
            <div
              key={staff.id}
              onClick={() => setSelectedStaffId(staff.id)}
              className={`staff ${staff.id === selectedStaffId ? "active" : ""}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px">
                <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17-62.5t47-43.5q60-30 124.5-46T480-440q67 0 131.5 16T736-378q30 15 47 43.5t17 62.5v112H160Zm320-400q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm160 228v92h80v-32q0-11-5-20t-15-14q-14-8-29.5-14.5T640-332Zm-240-21v53h160v-53q-20-4-40-5.5t-40-1.5q-20 0-40 1.5t-40 5.5ZM240-240h80v-92q-15 5-30.5 11.5T260-306q-10 5-15 14t-5 20v32Zm400 0H320h320ZM480-640Z" />
              </svg>
              <span>{staff.name}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "10px", margin: "10px 0" }}>
          <button
            onClick={addExampleEvent}
            style={{
              padding: "5px 10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}>
            Add Example Event (Oct 6, 2025)
          </button>
        </div>
        <FullCalendar
          ref={calendarRef}
          locale={auth.language}
          plugins={getPlugins()}
          contentHeight={400}
          handleWindowResize={true}
          selectable={true}
          editable={true}
          eventOverlap={true}
          eventDurationEditable={false}
          initialView="dayGridMonth"
          initialDate={initialDate || undefined}
          events={events}
          firstDay={1}
          dayMaxEventRows={4}
          fixedWeekCount={false}
          showNonCurrentDates={true}
          eventContent={(eventInfo: any) => <RenderEventContent eventInfo={eventInfo} />}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          datesSet={(info: any) => {
            const prevButton = document.querySelector(".fc-prev-button") as HTMLButtonElement;
            const nextButton = document.querySelector(".fc-next-button") as HTMLButtonElement;

            if (calendarInitialized && calendarRef?.current?.getApi().getDate()) {
              const currentViewDate = calendarRef?.current?.getApi().getDate();
              if (initialDate && !dayjs(initialDate).isSame(currentViewDate, "day")) {
                setTimeout(() => {
                  setInitialDate(currentViewDate);
                }, 0);
              }
            }

            const startDiff = dayjs(info.start)
              .utc()
              .diff(dayjs(schedule?.scheduleStartDate).subtract(1, "day").utc(), "days");
            const endDiff = dayjs(dayjs(schedule?.scheduleEndDate)).diff(info.end, "days");
            if (startDiff < 0 && startDiff > -35) prevButton.disabled = true;
            else prevButton.disabled = false;

            if (endDiff < 0 && endDiff > -32) nextButton.disabled = true;
            else nextButton.disabled = false;
          }}
          dayCellContent={({ date }) => {
            const found = validDates().includes(dayjs(date).format("YYYY-MM-DD"));
            const isHighlighted = highlightedDates.includes(dayjs(date).format("DD-MM-YYYY"));

            const formattedDate = dayjs(date).format("DD-MM-YYYY");
            const pairDate = pairDates.find((pd) => pd.date === formattedDate);

            const isPairDate = pairDate !== undefined;
            const pairClass = isPairDate ? `pair-highlight-${pairDate.pairIndex}` : "";

            return (
              <div
                className={`${found ? "" : "date-range-disabled"} ${
                  isHighlighted ? "highlighted-date-orange" : ""
                } ${isPairDate ? pairClass : ""}`}>
                {dayjs(date).date()}
              </div>
            );
          }}
        />
        <EventDetailsPopup />
      </div>
    </div>
  );
};

export default CalendarContainer;
