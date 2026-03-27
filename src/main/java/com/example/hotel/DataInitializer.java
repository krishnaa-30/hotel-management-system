package com.example.hotel;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.hotel.model.Room;
import com.example.hotel.repository.RoomRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoomRepository roomRepo;

    public DataInitializer(RoomRepository roomRepo) {
        this.roomRepo = roomRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        // Create some sample rooms on startup
        if (roomRepo.count() == 0) {
            Room r1 = new Room(); r1.setRoomNumber("101"); r1.setType("Deluxe"); r1.setPrice(150.0);
            Room r2 = new Room(); r2.setRoomNumber("102"); r2.setType("Suite"); r2.setPrice(300.0);
            Room r3 = new Room(); r3.setRoomNumber("103"); r3.setType("Single"); r3.setPrice(85.0);
            Room r4 = new Room(); r4.setRoomNumber("104"); r4.setType("Double"); r4.setPrice(110.0);
            Room r5 = new Room(); r5.setRoomNumber("105"); r5.setType("Deluxe"); r5.setPrice(150.0);
            Room r6 = new Room(); r6.setRoomNumber("106"); r6.setType("Suite"); r6.setPrice(300.0);
            Room r7 = new Room(); r7.setRoomNumber("107"); r7.setType("Single"); r7.setPrice(85.0);
            Room r8 = new Room(); r8.setRoomNumber("108"); r8.setType("Penthouse"); r8.setPrice(85.0);
            roomRepo.save(r1);
            roomRepo.save(r2);
            roomRepo.save(r3);
            roomRepo.save(r4);
            roomRepo.save(r5);
            roomRepo.save(r6);
            roomRepo.save(r7);
            roomRepo.save(r8);
            System.out.println(">> Sample Rooms Loaded into H2 Database!");
        }
    }
}