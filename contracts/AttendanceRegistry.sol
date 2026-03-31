// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AttendanceRegistry {
    struct EventData {
        uint256 id;
        string name;
        bool active;
    }

    address public owner;
    uint256 public nextEventId;

    mapping(uint256 => EventData) public eventsData;
    mapping(uint256 => mapping(address => bool)) public attendance;

    event EventCreated(uint256 indexed eventId, string name);
    event AttendanceRecorded(uint256 indexed eventId, address indexed attendee);
    event EventClosed(uint256 indexed eventId);

    modifier onlyOwner() {
        require(msg.sender == owner, "No autorizado");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createEvent(string memory name) external onlyOwner returns (uint256) {
        uint256 eventId = nextEventId;

        eventsData[eventId] = EventData({
            id: eventId,
            name: name,
            active: true
        });

        nextEventId++;
        emit EventCreated(eventId, name);
        return eventId;
    }

    function registerAttendance(uint256 eventId, address attendee) external onlyOwner {
        require(eventsData[eventId].active, "Evento inactivo");
        require(!attendance[eventId][attendee], "Asistencia ya registrada");

        attendance[eventId][attendee] = true;
        emit AttendanceRecorded(eventId, attendee);
    }

    function verifyAttendance(uint256 eventId, address attendee) external view returns (bool) {
        return attendance[eventId][attendee];
    }

    function closeEvent(uint256 eventId) external onlyOwner {
        require(eventsData[eventId].active, "Evento ya cerrado");
        eventsData[eventId].active = false;
        emit EventClosed(eventId);
    }
}
