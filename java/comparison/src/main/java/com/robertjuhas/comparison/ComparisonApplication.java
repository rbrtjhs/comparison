package com.robertjuhas.comparison;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.task.TaskExecutionAutoConfiguration;
import org.springframework.boot.web.embedded.tomcat.TomcatProtocolHandlerCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.core.task.support.TaskExecutorAdapter;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.Executors;

@RestController
@SpringBootApplication
public class ComparisonApplication {

	public static void main(String[] args) {
		SpringApplication.run(ComparisonApplication.class, args);
	}

	@Bean(TaskExecutionAutoConfiguration.APPLICATION_TASK_EXECUTOR_BEAN_NAME)
	public AsyncTaskExecutor asyncTaskExecutor() {
		return new TaskExecutorAdapter(Executors.newVirtualThreadPerTaskExecutor());
	}

	@Bean
	public TomcatProtocolHandlerCustomizer<?> protocolHandlerVirtualThreadExecutorCustomizer() {
		return protocolHandler -> {
			protocolHandler.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
		};
	}

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@GetMapping("/users")
	public ResponseEntity<List<UserDTO>> getUsers() {
		return ResponseEntity.ok(jdbcTemplate.query("SELECT * FROM account", (rs, num) -> {
			var id = rs.getLong(1);
			var firstName = rs.getString(2);
			var lastName = rs.getString(3);
			var address = rs.getString(4);
			return new UserDTO(id, firstName, lastName, address);
		}));
	}
}
