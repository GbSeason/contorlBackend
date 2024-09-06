import serial
import serial.tools.list_ports as lp
import serial.tools.list_ports_common
import threading


class Serials:
    def __init__(self, port, handle=None):
        self.handle = handle
        self.serial_ = None
        self.port = port
        self.findSerial()

    def findSerial(self):
        if self.port is None:
            ports = lp.comports()
            for i, port in enumerate(ports):
                if port.description.find("CH34") > 0:
                    self.port = port.name
        if self.port:
            self.startSerial()
        else:
            print("串口连接失败,端口错误")

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
        print(f"to serial: {cmd}")
        if self.serial_.isOpen():
            self.serial_.write(cmd.encode())
        else:
            self.serial_.open()
            self.serial_.write(cmd.encode())

    def close(self):
        if self.serial_.isOpen():
            self.serial_.close()
