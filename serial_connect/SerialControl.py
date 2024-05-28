import serial
import threading


class Serials:
    def __init__(self, port='COM1', handle=None):
        self.handle = handle
        self.serial_ = None
        self.port = port
        self.startSerial()

    def startSerial(self):
        try:
            self.serial_ = serial.Serial(self.port, 115200, timeout=0.5)
            self.serial_.setRTS(False)
            self.serial_.setDTR(False)

            serial_recv_thread = threading.Thread(target=self.__read_serial)
            serial_recv_thread.daemon = True
            serial_recv_thread.start()
        except Exception:
            print(f'serial open fail:{self.port}')
        finally:
            if self.serial_ is not None and self.serial_.isOpen():
                print(f'finally-- serial open success:{self.port}')
            else:
                print(f'finally-- serial open fail:{self.port}')

    def __read_serial(self):
        while True:
            data = self.serial_.readline().decode('utf-8')
            if data and self.handle is not None:
                self.handle(data)
                # print(f"Received: {data} and send to web", end='')

    def sendMsg(self, command_json):
        cmd = command_json + '\n'
        print(cmd)
        if self.serial_.isOpen():
            self.serial_.write(cmd.encode())
        else:
            self.serial_.open()
            self.serial_.write(cmd.encode())

    def close(self):
        if self.serial_.isOpen():
            self.serial_.close()
