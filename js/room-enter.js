const rooms = document.querySelectorAll("a.room-enter");

function needsTapReveal() {
  return window.matchMedia("(max-width: 760px), (hover: none), (pointer: coarse)").matches;
}

function hideRooms(except) {
  rooms.forEach((room) => {
    if (room !== except) {
      room.classList.remove("is-revealed");
    }
  });
}

rooms.forEach((room) => {
  room.addEventListener("click", (event) => {
    if (!needsTapReveal()) {
      return;
    }

    if (event.detail === 0) {
      return;
    }

    if (room.classList.contains("is-revealed")) {
      return;
    }

    event.preventDefault();
    hideRooms(room);
    room.classList.add("is-revealed");
  });
});

document.addEventListener("click", (event) => {
  if (!needsTapReveal() || event.target.closest("a.room-enter")) {
    return;
  }

  hideRooms();
});
