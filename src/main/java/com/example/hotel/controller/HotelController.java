package com.example.hotel.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.hotel.model.Room;
import com.example.hotel.model.User;
import com.example.hotel.repository.RoomRepository;
import com.example.hotel.repository.UserRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HotelController {

    @Autowired private RoomRepository roomRepo;
    @Autowired private UserRepository userRepo;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        user.setRole("CUSTOMER");
        return userRepo.save(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody User user) {
        return userRepo.findByUsername(user.getUsername())
                .filter(u -> u.getPassword().equals(user.getPassword()))
                .orElseThrow(() -> new RuntimeException("Invalid Credentials"));
    }

    @GetMapping("/rooms/available")
    public List<Room> getAvailable() { 
        return roomRepo.findByIsAvailable(true); 
    }

    @PostMapping("/rooms/book/{id}")
    public Room bookRoom(
            @PathVariable Long id, 
            @RequestParam String customerName,
            @RequestParam String checkIn,
            @RequestParam String checkOut,
            @RequestParam String email, 
            @RequestParam String phone, 
            @RequestParam double amount) { 
        
        Room room = roomRepo.findById(id).orElseThrow(() -> new RuntimeException("Room not found"));
        
        room.setAvailable(false);
        room.setBookedBy(customerName);
        room.setCheckInDate(checkIn);
        room.setCheckOutDate(checkOut);
        room.setGuestEmail(email);      
        room.setGuestPhone(phone);      
        room.setTotalPaid(amount);      
        
        return roomRepo.save(room);
    }

    // --- NEW CANCEL METHOD ---
    @PostMapping("/rooms/cancel/{id}")
    public Room cancelBooking(@PathVariable Long id) {
        Room room = roomRepo.findById(id).orElseThrow(() -> new RuntimeException("Room not found"));
        
        // Reset the room to available
        room.setAvailable(true);
        room.setBookedBy(null);
        room.setCheckInDate(null);
        room.setCheckOutDate(null);
        room.setGuestEmail(null);
        room.setGuestPhone(null);
        room.setTotalPaid(0.0);
        
        return roomRepo.save(room);
    }

    @GetMapping("/admin/rooms")
    public List<Room> getAll() { 
        return roomRepo.findAll(); 
    }
}