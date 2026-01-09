// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract PatientRecords {

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    // -------------------- Roles --------------------

    mapping(address => bool) public doctors;
    mapping(address => bool) public patients;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin allowed");
        _;
    }

    modifier onlyDoctor() {
        require(doctors[msg.sender], "Only doctor allowed");
        _;
    }

    modifier onlyPatient(address _patient) {
        require(msg.sender == _patient, "Access denied");
        _;
    }

    // -------------------- Patient Data --------------------

    struct Patient {
        string name;
        uint age;
        string diagnosis;
        string ipfsHash;
    }

    mapping(address => Patient) private records;

    // -------------------- Events --------------------

    event DoctorRegistered(address doctor);
    event PatientRegistered(address patient);
    event RecordAdded(address patient, string ipfsHash);

    // -------------------- Admin Functions --------------------

    function registerDoctor(address _doctor) public onlyAdmin {
        doctors[_doctor] = true;
        emit DoctorRegistered(_doctor);
    }

    function registerPatient(address _patient) public onlyAdmin {
        patients[_patient] = true;
        emit PatientRegistered(_patient);
    }

    // -------------------- Doctor Functions --------------------

    function addRecord(
        address _patient,
        string memory _name,
        uint _age,
        string memory _diagnosis,
        string memory _ipfsHash
    ) public onlyDoctor {

        require(patients[_patient], "Patient not registered");

        records[_patient] = Patient(
            _name,
            _age,
            _diagnosis,
            _ipfsHash
        );

        emit RecordAdded(_patient, _ipfsHash);
    }

    // -------------------- Patient Functions --------------------

    function getMyRecord()
        public
        view
        returns (string memory, uint, string memory, string memory)
    {
        require(patients[msg.sender], "Not a registered patient");

        Patient memory p = records[msg.sender];
        return (p.name, p.age, p.diagnosis, p.ipfsHash);
    }
}
